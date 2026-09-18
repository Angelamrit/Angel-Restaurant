# Angel — visual foundation

Status: implemented across the full website, 16 September 2026. Check every future component against this specification. `app/globals.css` is the executable source of truth; this file records intent and usage. Restaurant facts are preserved separately in [CONTENT_REFERENCE.md](./CONTENT_REFERENCE.md).

## Identity and principles

Modern Indian luxury, New York sophistication, Punjabi heritage, and warm hospitality. Gold Wine is the signature field color, supported by Golden Apricot actions. Warm ivory and cream form the primary light canvas. Espresso is reserved for navigation, the footer, the illustrated neighborhood map, and controlled cinematic moments. Luxury comes from deliberate composition, generous space, authentic photography, and readable details. Preserve Angel's Queens identity and approachable hospitality; visual ambition does not imply new restaurant claims or fine-dining policies.

Prefer open editorial compositions, alternating image-led and text-led moments, fine rules, and a clear reservation path. No gold gradients, ornamental Indian patterns, excessive rounded cards, glass panels, stock luxury clichés, or decorative motion.

## Research and interpretation

Reviewed official pages and their delivered HTML/media references on 16 September 2026. These are structural and source-level observations, not a claim to have exhaustively tested the competitors' live animation or mobile behavior.

- [Angel](https://angel-indian-restaurant-qucc.vercel.app/): preserves chef, neighborhood, signatures, story, menu, reservation, and practical visit responsibilities. The local repository is a fresh starter, not this deployed implementation.
- [Bungalow](https://www.bungalowny.com/about): image sequences and cultural storytelling give hospitality a human context; its delivered font declarations include Ovo and Almarai. Translate the narrative priority, not its typography or styling.
- [Ambassadors Clubhouse](https://ambassadorsclubhouse.com/newyork/faqs/): prominent reservation access and practical, grouped information support premium positioning. GSAP is referenced in its source; that alone does not establish particular observed effects. Angel needs clear booking and dietary information without adopting this restaurant's policies.
- [Qahwah Valley](https://www.qahwahvalley.com/): product and heritage stories alternate with media. Delivered data references MP4 assets, dark overlays, and a 700ms image-hover transform. Translate atmosphere into short, quiet craft footage; do not reproduce the layout or download its media for Angel.
- [Atomix](https://www.atomixnyc.com/about): concise cultural positioning, architectural imagery, recognition, and direct booking provide an editorial hierarchy. Translate the restraint and clarity.
- [Core by Clare Smyth](https://corebyclaresmyth.com/): dining-room imagery, food, chef, and team form a coherent hospitality narrative; reservations and menus remain easy to find. Translate this balance of atmosphere and utility.

Mobile direction is an Angel design decision: generous touch targets, natural document flow, readable menus, and visible booking access. Slow reveals, image masks, and line reveals are future directions, not effects copied or implemented now.

## Palette and semantic surfaces

| Primitive | Hex | Purpose |
| --- | --- | --- |
| Gold Wine | `#E5C88F` | Main signature background: soft champagne gold, replacing the deeper apricot field |
| Golden Apricot | `#D8A05F` | Signature fields, headings, primary actions |
| Rich Apricot | `#C78A45` | Reserved supporting accent; not small light-surface text |
| Soft Apricot | `#E8BB7A` | Dark-surface links and hover |
| Espresso | `#25130D` | Navigation/footer background and text on Gold Wine |
| Chocolate | `#351C13` | Raised dark surface |
| Warm Brown | `#5A3426` | Secondary surface, muted text on light surfaces |
| Ivory | `#E4D6C8` | Dark-surface body text |
| Cream | `#EADED2` | Light editorial background |
| Warm Stone | `#B99B83` | Muted dark-surface text; lifted from the initial suggestion for readability |
| Near-black Brown | `#160C08` | Deep surface and media scrim |

Ivory and cream were revised on 17 September 2026 from near-white pastels (`#F5E9D6` / `#FBF4E8`) to a deliberate weighted blend of Golden Apricot, Warm Brown, and white, at the client's request that the site's "white" tones read as combined with gold and brown rather than as plain off-white — Golden Apricot and Warm Brown themselves were explicitly left unchanged. Both new values still skew heavily toward white (roughly 75% white / 16% gold / 9% brown for cream, 70/18/12 for ivory) because they still function as light page backgrounds and as light text on dark surfaces; a more literal one-third/one-third/one-third blend would be too dark for either role and would break contrast against espresso and brown throughout the site.

Default semantics are light: `--background` cream; `--foreground`, `--body`, and `--heading` espresso; `--surface` and `--muted` ivory; `--surface-dark` near-black; `--surface-foreground` espresso; `--primary` apricot; `--primary-hover` soft apricot; `--primary-foreground` espresso; `--secondary` brown; `--muted-foreground` brown; `--accent` soft apricot. Links and focus use brown. Primary buttons use apricot with espresso text. Selection uses apricot/espresso. Decorative borders use 20% espresso; `--border-strong` uses brown.

Use `data-theme="ivory"` with `surface-theme` for cream/espresso sections. It also sets brown muted text, brown links/focus, ivory surfaces, and dark borders. `data-theme="apricot"` now uses Gold Wine/espresso, with espresso/cream primary buttons, following the client's background correction. Gold Wine is interpreted as a lighter champagne-gold tone; no exact client swatch was supplied. The existing scope name remains for compatibility. These scopes must be siblings rather than nested into one another; a nested dark theme is not supplied. Use `bg-surface text-surface-foreground` for raised surfaces. `--primary` always identifies the brand color; it is not a universal text color.

Never set apricot body text on ivory/cream, white text on apricot, or opacity on text to create muted colors. `--border` is decorative only; interactive outlines use `--border-strong`. Text pairs must meet WCAG AA (4.5:1 normal, 3:1 large), controls/focus 3:1. Verify text over every media crop separately. Calculated contrast: apricot/espresso 7.74:1; warm stone/chocolate 6.09:1; brown/apricot 4.66:1; soft apricot/espresso 10.04:1. Recalculated 17 September 2026 for the new ivory/cream values: ivory/espresso 12.54:1 (was 14.87:1); brown/cream 8.13:1 (was 9.83:1); espresso/cream 13.49:1 (was 16.31:1). All three dropped slightly, as expected from darkening ivory/cream, but every pairing still clears WCAG AA by a wide margin — re-verify again if either value moves further.

## Fonts and type

`next/font/google` in the root layout self-hosts Cormorant Garamond (500/600, normal and italic) and variable Manrope, with Latin subsets and `display: swap`. Build requires access to Google font files; visitors do not request fonts from Google. Font variables are applied to `html`; serif and sans fallbacks are explicit.

Cormorant's expressive curves and italics balance the architecture of the sans. Weight 500 avoids overly fragile display strokes. Bodoni Moda was considered more severe for Angel's warm direction; DM Serif Display offers less weight flexibility. Manrope keeps functional text clear without giving the site a dashboard tone.

| Class | Size range | Line height | Weight / tracking |
| --- | --- | --- | --- |
| `type-display-xl` | 52–160px | 1 | 500 / -0.035em |
| `type-display` | 56–120px | 1 | 500 / -0.035em |
| `type-h1` / h1 | 48–96px | 1.08 | 500 / -0.02em |
| `type-h2` / h2 | 40–72px | 1.08 | 500 / -0.02em |
| `type-h3` / h3 | 30–44px | 1.08 | 500 / -0.02em |
| `type-eyebrow` | 12px | 1.5 | 600 / 0.18em, uppercase |
| `type-body-lg` | 18–22px | 1.75 | 400 |
| `type-body` | 16px | 1.75 | 400 |
| `type-body-sm` | 14px | 1.75 | 400 |
| `type-navigation` | 14px | 1.5 | 600 / 0.025em |
| `type-button` | 12px | 1.5 | 600 / 0.12em, uppercase |
| `type-caption` | 12px | 1.5 | 400 |

Values use rem and fluid clamp, not fixed pixel font sizing. Display XL is only for short titles; use `type-h1` for long headings on narrow screens. Semantic heading levels describe the document, independently of visual scale. Use italics for brief emphasis, not entire paragraphs; uppercase belongs to short labels. Do not force desktop line breaks into mobile prose. Body measure: at most 62ch. Keep essential information at body size.

## Architecture, space, and layout

Preserve App Router, TypeScript, and Tailwind 4. No new dependencies. Primitive and semantic variables live in `:root`; `@theme inline` exposes scope-aware utilities such as `bg-background`, `text-heading`, `border-border`, `font-display`, `px-gutter`, `py-section`, and `gap-layout`. Base styles sit in `@layer base`; reusable type/button/container classes in `@layer components`, so utilities can override intentionally. Do not create a second Tailwind config or parallel theme object.

Spacing has one 0.25rem unit, exposed as Tailwind's `--spacing`. Prefer 4/8/12/16/24/32/48/64px steps through existing utilities; CSS uses multiples of `--space-unit`. Gutters scale 20–80px; section spacing 64–128px; compact sections 40–80px; layout gaps 24–64px. Use space to group related information rather than adding cards.

`container-shell` is centered, border-box, maximum 90rem including gutters. Inner maximums: `max-w-content` 78rem, `max-w-narrow` 48rem, `max-w-prose` 62ch. Use full-bleed media only when the image warrants it. No blanket overflow hiding to disguise layout bugs.

Keep Tailwind's existing breakpoints: sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem. CSS media queries cannot resolve custom properties; the nav-height query uses md's literal 48rem. Navigation height is 72px mobile / 88px desktop; use as minimum height for future nav, allowing wrapping/zoom. Content should work at 320px, tablet widths, large monitors, and 200% text zoom. Stack editorial columns on small screens, crop media intentionally, and preserve breathing room.

## Borders, radii, and depth

One-pixel rules, square editorial media, 2px control corners (`rounded-angel-control`), at most 4px panel corners (`rounded-angel-panel`). Avoid pill CTAs and repeated rounded cards. `shadow-angel-subtle` is reserved for small elevated controls; `shadow-angel-floating` for menus/dialogs. Most sections have no shadow. Z-index tokens: base 0, raised 10, nav 30, overlay 40, dialog 50, skip link 60.

## Buttons and navigation

Use `button button-primary` for the reservation action and `button button-secondary` for a supporting action. Both anchors and real buttons are supported; navigate with anchors and act with buttons. Minimum height 48px, horizontal padding 24px. Short uppercase labels, no icon dependency. Hover changes color only; disabled native buttons are dimmed and noninteractive. An anchor has no native disabled state: omit its destination or render noninteractive text rather than merely applying a disabled style.

Text links are underlined, with visible focus outlines. Future nav should carry the name, a restrained set of links, and an immediately available reservation CTA. Mobile needs an accessible menu toggle, expanded state, keyboard/focus handling, and a booking action that does not cover content or device safe areas. No navigation component or modal is built in this task.

## Motion

Fast feedback 160ms; UI 240ms; reveals 700ms; cinematic media 1200ms; optional stagger 80ms. Standard easing `cubic-bezier(0.2, 0, 0.2, 1)`; reveal easing `cubic-bezier(0.22, 1, 0.36, 1)`. Tailwind `ease-angel` / `ease-cinematic` bridge these tokens; durations use `duration-(--duration-ui)` etc.

Future reveals should move no more than 20px, scale imagery no further than 1.035, and run once. Content starts visible without JS; progressive enhancement must not leave it hidden. No bounce, spinning, scroll hijacking, or global smooth-scroll library. Native scrolling is retained. Reduced-motion CSS zeroes timing/distance tokens and suppresses CSS animation; future JS must also consult `matchMedia('(prefers-reduced-motion: reduce)')`, stop parallax, and keep content visible. Do not animate layout, blanket `transition: all`, or continuously apply `will-change`.

**Motion language, added in the 17 September 2026 art-direction pass — reuse these, don't invent parallel ones.** `Motion`'s reveal system now branches on the `data-reveal` attribute's value, not just its presence: plain `data-reveal` keeps the original JS-driven fade-up; `data-reveal="mask"` marks an element whose `.mask-reveal`/`.mask-reveal-inner` children are declared in `site.css` and animate purely in CSS (the JS only toggles `.is-revealed`) — use it for an oversized heading that should rise from behind a clip edge, on `PageIntro`'s `h1` (all six secondary pages) and the homepage's "From a family kitchen" `h2`; it works for any wrap length because it clips rather than assuming known line breaks. `data-reveal="line"` marks a `.apricot-rule`, a fine rule that draws itself left-to-right in the brand's gold — used under `PageIntro`'s eyebrow and beside the `Reservation` band's heading. Do not nest a `data-reveal="mask"` heading inside another `data-reveal` wrapper; that produces two competing motions on the same content, which is why the signature grid, story-home, gallery-home and visit-section headings were deliberately left on their existing whole-block fade instead of converted. `Motion` also runs one delegated `pointermove` listener (not per-button wrappers) that nudges any `.button-primary` a few pixels toward the cursor via `--mx`/`--my`, gated on `(hover: hover) and (pointer: fine)` and `prefers-reduced-motion`; `.button-primary:hover` and `.header-actions .button:hover` read those custom properties (they default to `0px`, so nothing changes where JS hasn't run). Golden Apricot's "light source" treatment — a blurred `radial-gradient` on a `::before`, not a filled surface — lives on `.room-copy` and `.footer-top .wordmark`; reach for it before adding another apricot-filled panel. A body-level `::before` with an inline SVG `feTurbulence` tile gives the whole site a ~3.5% opacity `mix-blend-mode: overlay` grain; it is static (not gated on reduced motion, since it has none) and sits at `z-index: 5`, below nav/overlay/dialog so chrome stays crisp.

**Hero, redesigned 17 September 2026 to a full-bleed pattern — the photograph is the entire `.hero` section, not a boxed image beside the type.** `CinematicSlideshow` gets `className="hero-media"` directly and sits `position: absolute; inset: 0` as the section's own background; a sibling `.hero-scrim` (a `linear-gradient` darkest at the top and bottom, lightest through the middle) sits above it for text legibility; `.hero-content` (flex column, `justify-content: space-between`, `min-height: 100svh`) carries the topline/headline/foot over both. Because the section is now dark-photo-backed rather than the gold-wine field the rest of the site uses, hero type runs light (`--cream`) with `text-shadow` for legibility, not the usual espresso-on-light pattern — this is the one section where that's correct. `.hero-stamp` (the Michelin badge) is positioned via a `--stamp-rest` custom property rather than a literal `transform`, specifically so its `hero-stamp-in` entrance keyframe and its resting position (which differs desktop vs. the ≤48rem breakpoint) always agree — redefining `transform` directly on `.hero-stamp` in a new breakpoint without also updating what the keyframe animates to will reintroduce the exact position-jump bug this pattern was written to avoid. The heading keeps its two `.hero-line` wrappers, each holding two physical lines via `<br />` ("Some places / feed you." and "Others stay / with you."); verified across desktop, tablet, mobile and `prefers-reduced-motion` at full settle, this reads cleanly. A screenshot taken mid-choreography (before the ~1.5s staggered rise completes) will show the two wrappers visually overlapping — that's the entrance animation still in flight, not a layout bug; wait for it to finish before judging this heading's spacing. `CinematicSlideshow`'s own pause/progress controls default to the bottom-right of whatever frame contains them; `.hero-media .cinematic-controls` lifts them clear of `.hero-foot` specifically because the frame is now the whole section instead of a small boxed image.

## Photography and video

Commission or use approved authentic Angel imagery: chef and hands, tandoor fire, food texture, plating, dining-room warmth, drinks, and hospitality. Preserve believable food and skin color; avoid heavy orange filters. The legacy site marks some assets as editorial relights and others as stock: these need review before reuse.

Image ratios: editorial 4:5, landscape 3:2, cinematic 16:9. Use `next/image` with accurate sizes, explicit aspect ratio/dimensions, meaningful alt text, and an intentional focal point per breakpoint. Load below-fold imagery lazily; prioritize only the real LCP image. Scrim token is available, but do not assume one scrim guarantees readable text on all footage.

Video should use short, quiet loops with a stable poster, muted audio, playsInline, and no essential information conveyed only through movement. Provide pause controls for ongoing motion; captions/transcripts for informative footage. Do not download/autoplay video under reduced motion; defer offscreen video, pause when hidden, and offer still imagery for constrained connections. Prevent layout shifts and avoid multiple competing loops.

The 17 September 2026 art-direction pass looked hard for a place to introduce real cinematic video and did not add any: no such footage existed in `public/angel` at the time, and inventing restaurant-specific footage was out of scope. **The client supplied a video on the same day** (`public/videos/hero-loop.mp4`, a 5-second, 1536×1024 muted loop of a dining room), which now plays as the homepage hero's full-bleed background via `components/hero-video.tsx`. That component is the reference implementation for every rule in this section: it renders no `<video>` element at all under `prefers-reduced-motion` (the poster image is the entire background instead, via `next/image`, not a plain `<img>`), it pauses on `visibilitychange` when the tab is hidden and resumes only if the visitor didn't pause it themselves, it falls back to the poster on any load error, and it exposes a manual pause control reusing `.cinematic-pause`'s visual language. Reuse this component for any future hero-style video rather than writing a second one. Two things are still unverified and worth confirming before launch: whether this footage is Angel's own dining room or stock/generated b-roll (it does not visually match `interior-aceva.webp`, which is the only interior photography with documented Angel provenance) — the site has otherwise been careful never to present stock or relit imagery as documentary Angel photography, so this is worth the client's explicit confirmation; and the file is an uncompressed-looking ~4.3MB for 5 seconds (~6.9 Mbps), well above typical web-delivery bitrates for a background loop — re-encode it before launch if bandwidth on real connections matters.

`GalleryLightbox` (`components/gallery-lightbox.tsx`) turns `/gallery`'s grid into an actual viewer: click a photo, get a focus-trapped, Escape/arrow-key-navigable full-screen frame. Reuse this component (pass a `{ name, label }[]`) rather than building a second lightbox if another page ever needs one. `.story-image-accent` on the homepage's story section is this pass's one deliberate "overlapping print" composition — a second, smaller `Photo` absolutely positioned over the corner of the first, framed in cream, offset less aggressively under 48rem so it can't cause horizontal overflow. Apply the same technique sparingly elsewhere; using it on every image would flatten it back into decoration. `MenuExplorer`'s dish cards carry a `--i` custom property and stagger their entrance via `animation-delay: calc(var(--i) * 55ms)` on category switch — extend that `--i` pattern rather than reintroducing a single block-level fade if another filterable grid is added.

## Accessibility and delivery

Keep meaningful landmarks and one main heading. Every page must provide `main#main-content` for the root skip link; current preview uses `tabIndex={-1}`. Never remove focus outlines. Maintain 48px touch targets for controls, visible labels for fields, and non-color error feedback. Native forms inherit the theme and use strong boundaries. Do not claim restaurant physical accessibility based on website accessibility.

The implemented routes are `/`, `/menu`, `/story`, `/gallery`, `/private-dining`, `/visit`, `/faq`, `/press`, and `/privacy`. The private-dining form submits through a Server Action to Resend; it falls back to preparing an email in the visitor's mail app only when delivery fails or is unconfigured, and its copy states that behavior. Default site styling deliberately does not switch with OS light/dark preference.

**This is the site's adopted information architecture; do not reorder it without a reason.** Primary nav, left to right: Menu, Our story, The experience (gallery), Private dining, Visit us, with Reserve always reachable (header button on desktop, the fixed `.mobile-reserve-bar` on mobile). Footer, top to bottom: Find us (address/directions), Join us (hours/Resy), Say hello (phone/email/Instagram), a secondary nav (Menu, Private dining, FAQ, Visit Angel), then the bottom row (copyright, halal/bar/Queens line, Privacy & terms). If the client later confirms one of the features flagged as needing confirmation (17 September 2026 audit), its home is already decided rather than open for redesign: online ordering becomes a header/hero CTA beside Reserve, not a new page; catering becomes a section appended to `/private-dining`, not a new route; gift cards becomes a footer link; verified testimonials become a new homepage strip near the existing recognition/press section. Build straight into these slots — do not re-litigate placement.

Before shipping future components: check token use, mobile wrapping, keyboard order, contrast across surface scopes, reduced motion, media weight, and factual accuracy. Run `npm run lint`, `npm run build`, and `npx tsc --noEmit` after generated Next route types exist.

A final QA pass on 17 September 2026 corrected several `--apricot` / `--apricot-soft` text-color rules that had drifted onto light backgrounds (cream, ivory, gold-wine) in `.story-copy .type-body-lg`, `.recognition > div span:hover`, `.gallery-group`/`.gallery-grid` caption hovers, `.faq-list summary .type-caption`, `.form-intro .type-eyebrow`, and `.form-status a` — each measured under 2:1 contrast and now uses `--brown`, matching the "never apricot body text on ivory/cream" rule above. The same pass added the site-wide metadata layer this spec assumed but the code never shipped: `metadataBase`, per-page canonical/OpenGraph/Twitter metadata and descriptions, a `viewport` export, `robots.ts`, `sitemap.ts`, a token-built `opengraph-image.tsx`, and a `Restaurant` JSON-LD block sourced only from CONTENT_REFERENCE.md facts (no rating, price range, or menu data was invented). It also closed a mobile-navigation gap: the full-screen menu overlay did not lock body scroll; `Header` now does. `restaurant.siteUrl` in `lib/restaurant.ts` is a placeholder pending the client's production domain — see its TODO comment.
