# Deploying on the Hostinger VPS

The site runs on a Hostinger KVM VPS (Ubuntu), behind nginx, with MongoDB for the data. Vercel was only used for the first client preview and is no longer part of the setup. Nothing in this guide contains a secret: put real values in the server's environment file, never in git.

## What is already done

| Item | State |
| --- | --- |
| Server | `srv2025842.hstgr.cloud`, IPv4 `187.126.117.52` |
| Domain `angelindianrestaurantnyc.com` | `@` points at the server, `www` points at `@` |
| Email sending (Resend) for the same domain | DKIM, the two Resend CNAMEs and DMARC are in the Hostinger DNS zone. Click **Verify** on the domain in Resend once |
| Mailboxes | None. The restaurant uses `angelrestaurant278@gmail.com`; the domain only *sends* enquiry notifications |

## 1. One-time server setup

```bash
# Node 24 LTS (minimum 22.18), nginx, certificates, a process manager
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx ufw git
# install Node 24 from NodeSource or nvm, then:
sudo npm install -g pm2

# The VPS has no Hostinger firewall group, so use the OS firewall. Only web traffic gets in; the app itself
# listens on 127.0.0.1 and is reachable only through nginx (this is what makes the client-address header trustworthy).
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

## 2. Environment

Create `/var/www/angel/.env.production.local` (git ignores `.env*`). Next.js reads it for both `build` and `start`.

```ini
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://angelindianrestaurantnyc.com   # needed at BUILD time: canonical URLs, sitemap, share cards
ADMIN_ORIGIN=https://angelindianrestaurantnyc.com           # the exact public origin, https, no trailing slash
ADMIN_PASSWORD_HASH=<the line printed by: npm run admin:password>   # 8 to 16 characters; only the hash lives on the server

MONGODB_URI=<Atlas connection string, or mongodb://127.0.0.1:27017 for a MongoDB on this server>
MONGODB_DB=angel-restaurant

RESEND_API_KEY=<Resend key>
CONTACT_FROM_EMAIL="Angel Website <enquiries@angelindianrestaurantnyc.com>"   # must be on the domain verified in Resend
CONTACT_TO_EMAIL=angelrestaurant278@gmail.com

OPENAI_API_KEY=<key>                  # the Ask Angel assistant
CLIENT_IP_HEADER=x-real-ip            # see "Rate limits" below. Required behind nginx
# Optional: NEXT_PUBLIC_GA_MEASUREMENT_ID, ANALYTICS_TIMEZONE (default America/New_York)
```

Leave `BLOB_READ_WRITE_TOKEN` unset. Dish photos uploaded in the admin are then saved on this server in `.data/uploads` (the folder is git-ignored and survives updates; **include it in your backups**).

## 3. nginx

`/etc/nginx/sites-available/angel`:

```nginx
server {
    server_name angelindianrestaurantnyc.com www.angelindianrestaurantnyc.com;
    client_max_body_size 6m;                       # photo uploads are limited to 4 MiB by the app

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;   # OVERWRITES anything the visitor sent
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_buffering off;                       # lets the chat answer stream
    }
    listen 80;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/angel /etc/nginx/sites-enabled/angel
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d angelindianrestaurantnyc.com -d www.angelindianrestaurantnyc.com   # HTTPS; also adds the redirect
```

HTTPS is required: the visitor and admin cookies are marked secure, and the site sends an HSTS header.

## 4. First deployment

```bash
cd /var/www && git clone <repo-url> angel && cd angel && git checkout main
npm ci
npm run build
npm run db:migrate        # creates the indexes (safe to re-run)
npm run db:seed           # first time only: loads the original menu
pm2 start "npx next start -H 127.0.0.1 -p 3000" --name angel
pm2 save && pm2 startup   # restart on reboot
```

## 5. Every later update

```bash
cd /var/www/angel && git pull && npm ci && npm run build && npm run db:migrate && pm2 restart angel
```

## Rate limits and `CLIENT_IP_HEADER`

The enquiry form (3 per 10 minutes per visitor), the chat and the admin sign-in all limit by visitor address. The app can only know the address from a header your proxy sets. Without `CLIENT_IP_HEADER`, **every visitor shares one bucket**: three people sending enquiries inside ten minutes would block everyone else. With nginx as above, set `CLIENT_IP_HEADER=x-real-ip`.

Only set it when nginx really overwrites that header and the app is **not** reachable except through nginx (step 1: the app listens on `127.0.0.1`, the firewall allows only web traffic). Otherwise a visitor could invent addresses and dodge the limits.

## Checking it works

1. `https://angelindianrestaurantnyc.com/api/health` responds.
2. Send a test enquiry on `/private-dining`. It must land in **Admin → Enquiries**. If the email did not arrive, that page shows the exact reason (for example an unverified domain or a missing key), and the form tells the visitor the email alert failed.
3. Browse a few public pages in a normal window, then look at **Admin → Analytics** for the visitor counts.
