-- Roles, teacher applications, and teacher-created courses.

create table if not exists profiles (
  user_id    text primary key,
  role       text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  headline   text not null default '',
  bio        text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists teacher_applications (
  user_id     text primary key,
  pitch       text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create table if not exists course_overrides (
  course_slug text primary key,
  published   boolean not null default true,
  featured    boolean not null default false
);

create table if not exists studio_courses (
  slug             text primary key,
  owner_id         text not null,
  title            text not null,
  subtitle         text not null default '',
  description      text not null default '',
  category         text not null,
  level            text not null,
  poster           text not null,
  instructor_name  text not null,
  instructor_title text not null default '',
  instructor_bio   text not null default '',
  published        boolean not null default false,
  featured         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists studio_courses_owner_idx on studio_courses (owner_id);

create table if not exists studio_lessons (
  course_slug      text not null references studio_courses (slug) on delete cascade,
  lesson_slug      text not null,
  sort_order       integer not null default 0,
  title            text not null,
  summary          text not null default '',
  transcript       text not null default '',
  video_json       text not null,
  preview          boolean not null default false,
  duration_seconds integer not null default 0,
  primary key (course_slug, lesson_slug)
);
