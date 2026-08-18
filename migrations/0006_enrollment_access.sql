alter table enrollments
  add column if not exists access_days integer,
  add column if not exists expires_at timestamptz,
  add column if not exists source text not null default 'self',
  add column if not exists enrolled_by text;

alter table studio_courses
  add column if not exists access_days integer;

alter table course_overrides
  add column if not exists access_days integer;
