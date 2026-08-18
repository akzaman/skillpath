# National Education Center

Mini-courses for life in Italy — tax, dichiarazione, CAF, Patronato, Patente B, Italian A1–A2, spoken Italian, Sportello Immigrazione, and business.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akzaman/skillpath&project-name=skillpath&repository-name=skillpath&env=BETTER_AUTH_SECRET,BETTER_AUTH_URL,VITE_AUTH_ENABLED&envDescription=Auth%20settings.%20Add%20Neon%20from%20Storage%20for%20DATABASE_URL.)


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

## Deploy on Vercel

The GitHub repo is ready. Open this link while logged into Vercel:

**https://vercel.com/new/clone?repository-url=https://github.com/akzaman/skillpath**

1. Import **akzaman/skillpath**
2. Storage → Connect Store → **Neon** (sets `DATABASE_URL`)
3. Environment variables:

| Name | Value |
| --- | --- |
| `BETTER_AUTH_SECRET` | any long random string |
| `BETTER_AUTH_URL` | the `*.vercel.app` URL Vercel shows |
| `VITE_AUTH_ENABLED` | `true` |

4. Deploy — `npm run build` applies `migrations/` to Neon

## Scripts

```bash
npm run dev        # local app
npm run build      # production build + migrate
npm run typecheck
```
