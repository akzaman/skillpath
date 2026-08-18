create table if not exists access_emails (
  user_id     text not null,
  course_slug text not null,
  kind        text not null,
  window_key  text not null,
  sent_at     timestamptz not null default now(),
  primary key (user_id, course_slug, kind, window_key)
);

create table if not exists access_email_runs (
  id     text primary key,
  ran_at timestamptz not null default now()
);
