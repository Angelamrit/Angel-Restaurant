CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, filter TEXT NOT NULL, title TEXT NOT NULL,
  kicker TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY, name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '', price_cents INTEGER NOT NULL CHECK(price_cents BETWEEN 0 AND 1000000),
  category_id TEXT NOT NULL REFERENCES categories(id),
  type TEXT NOT NULL CHECK(type IN ('regular', 'chef-special')),
  image TEXT NOT NULL DEFAULT '', available INTEGER NOT NULL CHECK(available IN (0,1)),
  visible INTEGER NOT NULL CHECK(visible IN (0,1)), sort_order INTEGER NOT NULL DEFAULT 0,
  vegetarian INTEGER NOT NULL DEFAULT 0 CHECK(vegetarian IN (0,1)),
  vegan INTEGER NOT NULL DEFAULT 0 CHECK(vegan IN (0,1)), tag TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)), featured_description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  CHECK(type <> 'chef-special' OR length(image) > 0), CHECK(vegan = 0 OR vegetarian = 1)
);
CREATE INDEX IF NOT EXISTS menu_public_order ON menu_items(visible, available, category_id, sort_order);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY, url TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);
