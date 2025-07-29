```md
# Dhara — Decentralized Cleanup Drive Coordinator 🧹🌍

**Mission:**  
Empower local citizens in Indian tier-2 & semi-urban cities to coordinate cleanup drives — without waiting for government action.

Users can mark garbage spots, vote on priorities, join or create drives, upload proof, and track collective impact.

---

## ⚙️ Tech Stack

| Layer          | Stack / Tooling                                  |
| -------------- | ------------------------------------------------ |
| **Frontend**   | Next.js (App Router), Tailwind CSS, shadcn/ui    |
| **Backend**    | Node.js, Express.js, Neon PostgreSQL, Prisma ORM |
| **Auth**       | Clerk                                            |
| **Real-time**  | Pusher (optional: future live updates)           |
| **Maps**       | Leaflet.js + OpenStreetMap (no credentials)      |
| **Uploads**    | ImageKit (secure, optimized delivery)            |
| **Storage**    | PostgreSQL + PostGIS (geospatial)                |
| **Caching**    | Redis via Upstash                                |
| **Deployment** | Vercel (frontend), Render or Railway (API)       |
| **CI/CD**      | GitHub Actions + Husky pre-commit hooks          |

---

## 🚀 MVP Features

| Feature              | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| **Auth**             | Clerk-based login (email, Google, no Aadhaar nonsense)                     |
| **Create Drive**     | Pin location on map, add type (clean, plant, recycle), upload before image |
| **Join Drive**       | See upcoming drives filtered by location, time, and vote urgency           |
| **Vote on Areas**    | Mark garbage zones; upvote to prioritize                                   |
| **Progress Tracker** | Upload after photos, show contributors, drive status                       |
| **Reminders & XP**   | Email/local reminders, streaks, gamified XP for contributions              |

---

## 🔮 Future Enhancements

| Area                | Feature                                         |
| ------------------- | ----------------------------------------------- |
| **Gamification**    | Leaderboards, XP levels, contribution timeline  |
| **Languages**       | Hindi, Marathi, Gujarati, Kannada, Bengali      |
| **NGO Mode**        | Org accounts to manage their own team & drives  |
| **Offline Support** | Queue drive joins/uploads while offline         |
| **Moderation**      | Spam/vote abuse detection                       |
| **Impact Metrics**  | Visualize cleaned areas, types, frequency       |
| **UPI Rewards**     | Optional micro-donations from NGO to volunteers |

---

## 🧠 Architecture Notes

| Concept            | Notes                                                             |
| ------------------ | ----------------------------------------------------------------- |
| **Atomic Actions** | Use `Prisma.$transaction()` to group drive + participant creation |
| **Redis Caching**  | Vote throttling, caching nearby drives                            |
| **PostGIS Use**    | For geospatial bounding box, within-radius queries                |
| **Signed Uploads** | ImageKit signed uploads prevent abuse                             |
| **Monorepo**       | PNPM + Turborepo for unified DX                                   |

---

## 📁 Folder Structure (Turborepo)
```

/dhara
├── apps/
│ ├── api/ # Express + Prisma backend
│ │ ├── src/
│ │ │ ├── controllers/
│ │ │ ├── routes/
│ │ │ ├── services/
│ │ │ ├── middlewares/
│ │ │ ├── utils/
│ │ │ └── index.ts
│ │ ├── .env # API-only secrets
│ │ ├── package.json
│ │ └── tsconfig.json
│
│ └── web/ # Next.js frontend
│ ├── app/ # App Router pages
│ ├── components/ # UI components
│ ├── lib/ # Helpers: auth, uploads, maps
│ ├── public/ # Static files
│ ├── styles/ # Tailwind / global styles
│ ├── .env # NEXT_PUBLIC\_ keys only
│ ├── package.json
│ ├── tailwind.config.ts
│ ├── postcss.config.mjs
│ └── tsconfig.json
│
├── packages/
│ ├── db/ # Prisma schema, client, migrations
│ │ ├── prisma/
│ │ │ ├── schema.prisma
│ │ │ └── migrations/
│ │ ├── .env # DATABASE_URL only
│ │ └── package.json
│
│ ├── config/ # Shared tsconfig, tailwind, eslint
│ │ ├── tsconfig.base.json
│ │ ├── tailwind.config.ts
│ │ ├── eslint.config.mjs
│ │ └── prettier.config.js
│
│ ├── utils/ # Shared logic (auth, geo, types)
│ │ ├── auth.ts
│ │ ├── geo.ts
│ │ └── index.ts
│
│ └── ui/ # Centralized shadcn/ui wrapper components
│ ├── button.tsx
│ ├── input.tsx
│ └── index.ts
│
├── .env.example # Template for environment vars
├── .gitignore
├── turbo.json # Turborepo pipeline
├── pnpm-workspace.yaml
├── package.json
└── README.md

````

---

## 🔐 Environment Variables

| File                | Purpose                         | Example Keys                                                                 |
|---------------------|----------------------------------|------------------------------------------------------------------------------|
| `apps/api/.env`     | Private API creds               | `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `IMAGEKIT_PRIVATE_KEY`           |
| `apps/web/.env`     | Public frontend config          | `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `NEXT_PUBLIC_API_BASE_URL`, etc.        |
| `packages/db/.env`  | Prisma db url                   | `DATABASE_URL`                                                              |

---

## 🏁 Getting Started

```bash
# Clone
git clone https://github.com/your-org/dhara.git
cd dhara

# Install
pnpm install

# Setup envs
cp .env.example apps/web/.env
cp .env.example apps/api/.env

# Dev
pnpm dev
````

---

## 🚀 Deployment Plan

| Platform     | App        | Notes                             |
| ------------ | ---------- | --------------------------------- |
| **Vercel**   | `apps/web` | Connect repo, auto deploy via CI  |
| **Render**   | `apps/api` | Start with simple Node service    |
| **Neon**     | DB         | Free tier + PostGIS support       |
| **Upstash**  | Redis      | 10k req/day free tier             |
| **ImageKit** | Uploads    | Public & signed upload separation |

---

## 🙌 Contribute

Dhara is built by people who care.
Raise issues, propose features, or just fork and ship improvements.
Let’s clean things up — together.

```

```
