create table if not exists lesson_events (
  id               bigserial primary key,
  user_id          text not null,
  course_slug      text not null,
  lesson_slug      text not null,
  topic_id         text,
  kind             text not null,
  position_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists lesson_events_course_idx
  on lesson_events (course_slug, lesson_slug, kind, created_at desc);
create index if not exists lesson_events_user_idx
  on lesson_events (user_id, created_at desc);

create table if not exists topic_progress (
  user_id    text not null,
  course_slug text not null,
  lesson_slug text not null,
  topic_id   text not null,
  viewed     boolean not null default true,
  completed  boolean not null default false,
  seconds    integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_slug, topic_id)
);
create index if not exists topic_progress_course_idx
  on topic_progress (course_slug, lesson_slug);
