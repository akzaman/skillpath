-- Per-user learning data for Atelier. Catalog itself is static.

create table if not exists enrollments (
  user_id     text not null,
  course_slug text not null,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);
create index if not exists enrollments_user_idx on enrollments (user_id);

create table if not exists lesson_progress (
  user_id          text not null,
  course_slug      text not null,
  lesson_slug      text not null,
  position_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  completed        boolean not null default false,
  updated_at       timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_slug)
);
create index if not exists lesson_progress_user_idx on lesson_progress (user_id, updated_at desc);

create table if not exists lesson_notes (
  user_id     text not null,
  course_slug text not null,
  lesson_slug text not null,
  body        text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_slug)
);

create table if not exists bookmarks (
  user_id     text not null,
  course_slug text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, course_slug)
);
create index if not exists bookmarks_user_idx on bookmarks (user_id);
