```markdown
# 🌿 DHARA - Community-Driven Environmental Platform

**A platform for citizens to report, organize, and participate in cleaning drives while supporting mental well-being, inclusivity, and sustainability.**

---

## **Table of Contents**

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Usage](#usage)
7. [License](#license)

---

## **Project Overview**

DHARA is a community-driven platform designed to tackle environmental neglect and promote civic responsibility in India. It empowers citizens of all ages and backgrounds-students, professionals, homemakers, children, and the elderly-to actively participate in cleaning and greening their neighborhoods according to their availability and comfort.

Key goals of DHARA:

- **Report and Raise Awareness:** Citizens can report dirty or neglected areas by uploading images, videos, and descriptions. This ensures that communities are aware of problem spots that need attention.
- **Organize and Participate in Drives:** Cleaning drives are scheduled based on community votes, allowing individuals to join activities that fit their personal schedules. This flexible system ensures maximum participation, even for those with unconventional routines or commitments.
- **Track Real Impact:** The platform monitors progress using before-and-after visuals, trees planted, and recyclable waste processed. This fosters accountability and encourages long-term engagement.
- **Enhance Community and Mental Well-Being:** DHARA offers low-pressure participation, micro-tasks, and optional social interaction. Even those who are introverted or dealing with mental health challenges can contribute meaningfully by simply being present.
- **Sustainability and Aesthetics:** Cleaned areas are not only maintained but also beautified, with trees planted and waste sent to proper recycling facilities. The goal is to create spaces that communities are proud of and motivated to protect.

DHARA is more than a cleaning platform - it’s a movement for environmental consciousness, civic engagement, and mental wellness, designed to make it easy for anyone to contribute to a cleaner, greener, and healthier community.

## **Live Demo**

Check out the live platform here: [https://dhara-green.vercel.app/](https://dhara-green.vercel.app/)

---

## **Features**

- **User Authentication:** Sign-up/login using **NextAuth**.
- **Flexible Drives:** Users can choose times and tasks according to their schedule.
- **Report Areas:** Upload images/videos and provide details of neglected areas.
- **Voting & Participation:** Community votes on drives and schedules.
- **Impact Tracking:** Track cleaned areas, trees planted, and garbage collected.
- **Mental Health Friendly:** Silent participation, micro-tasks, and non-social contributions.
- **Image Handling:** Optimized image upload and delivery using **ImageKit**.
- **Admin Verification:** Verify reported areas before drives.

---

## **Tech Stack**

- **Frontend & Backend:** Next.js + TypeScript (Monorepo)
- **Authentication:** NextAuth.js
- **Database:** PostgreSQL
- **ORM:** Neon
- **Image Upload & CDN:** ImageKit
- **Hosting:** Vercel
- **Caching & Rate Limiting:** Upstash Redis
- **Cron Jobs:** For reminders, notifications, and recurring tasks

---

## **Project Structure**
```

/dhara
├── /apps
│ └── web # Next.js app (frontend + backend)
├── /packages
│ ├── api # API logic, routes (e.g., /drives, /reports)
│ ├── types # Shared TypeScript types
│ ├── utils # Utility functions, helpers
├── /public
├── /styles
├── next.config.js
├── tsconfig.json
└── package.json

````

**Key API Routes:**

* `/api/auth` - Authentication
* `/api/drives` - CRUD for cleaning drives
* `/api/reports` - CRUD for reported dirty areas
* `/api/users` - User profiles and participation history

---

## **Setup & Installation**

1. Clone the repository:

```bash
git clone https://github.com/yourusername/dhara.git
cd dhara
````

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables.

4. Run the development server:

```bash
pnpm dev
```

---

## **Usage**

- **Sign Up / Login:** Create an account using Google or email.
- **Report a Dirty Area:** Upload images/videos and provide location/details.
- **Join a Drive:** Vote for preferred time and task.
- **Track Impact:** View before/after pictures, trees planted, and garbage recycled.
- **Silent Participation:** Choose micro-tasks if you prefer not to interact socially.

---

## **License**

MIT License © 2025 DHARA

---

```

```
