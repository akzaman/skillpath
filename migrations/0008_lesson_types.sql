alter table studio_lessons
  add column if not exists lesson_type text not null default 'video';
