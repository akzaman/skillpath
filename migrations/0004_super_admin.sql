-- Promote the site owner if they already have an account.
update profiles
set role = 'admin'
where user_id in (
  select id from "user"
  where lower(email) = 'md.akteruzzaman@gmail.com'
);
