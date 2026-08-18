# Skillpath

Video course marketplace — students learn, teachers publish, admins run the school.

## Stack

- TanStack Start + React 19
- Better Auth (email / password)
- Neon Postgres
- Vercel (host + CDN)

## Roles

| Role | What they do |
| --- | --- |
| Student | Browse, enroll, watch, track progress |
| Teacher | Create courses and lectures in the studio |
| Admin | Users, roles, catalog |

## Deploy

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Add the **Neon** integration so `DATABASE_URL` is set
4. Set `BETTER_AUTH_SECRET` (random 32+ chars) and `BETTER_AUTH_URL` to the live site
5. Redeploy — `npm run build` applies `migrations/` to Neon

Local preview without Neon uses an in-memory database.

## Scripts

```bash
npm run dev        # local app
npm run build      # production build + migrate
npm run typecheck
```
