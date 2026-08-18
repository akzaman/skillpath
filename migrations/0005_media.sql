create table if not exists media_assets (
  id         text primary key,
  owner_id   text not null,
  mime       text not null,
  bytes      bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists media_assets_owner_idx on media_assets (owner_id);
