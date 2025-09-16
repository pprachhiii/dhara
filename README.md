# **DHARA**

**Community-driven platform for environmental stewardship and civic responsibility in India**

DHARA empowers citizens of all ages—students, professionals, homemakers, children, and the elderly—to actively participate in cleaning, beautifying, and maintaining neighborhoods. Participation is flexible and aligned with people’s availability, comfort, and mental well-being.

The platform integrates **reporting neglected areas**, **authority contact tracking**, **centralized community voting**, **volunteer-driven drives**, and **monitoring & beautification** into a practical, inclusive, and accountable civic movement.

---

## **Core Goals**

1. **Report neglected spaces** with evidence.
2. **Contact relevant authorities** before community action.
3. **Centralize voting & discussions** for prioritization.

4. **Organize volunteer-driven drives** (cleanup, tree planting, beautification).
5. **Sustain outcomes** with monitoring and aesthetics.
6. **Track contributions** for accountability and recognition.

---

## **Key Features**

### 1. Report Phase (Citizen Action)

- Citizens upload **photos/videos + description** of neglected areas.
- Status: **PENDING** and **eligible for authority contact** → **AUTHORITY_CONTACTED**.

### 2. Authority Contact Phase (Volunteer → Authority)

- Volunteers log contacts: **Contact Official** / **Already Contacted**.
- 7-day wait post-contact:

  - ✅ **Resolved by authority** → **UNDER_MONITORING**.
  - ❌ **No action** → **ELIGIBLE_VOTE** (community voting).

### 3. Centralized Report Voting Hub

- All eligible reports appear in a **single voting pool**.
- Centralized discussion thread for **priority debate**.
- **Voting window:** 7 days.
- After voting → **REPORT_VOTING_FINALIZED** → next phase: **ELIGIBLE_DRIVE**.

### 4. Drive Creation & Centralized Drive Voting

- Volunteers propose **Drives** linked to prioritized reports.
- Drive includes linked reports, schedule, and tasks.
- **Drive Voting Hub** centralized discussion.
- **Voting window:** 7 days.
- Winning drives → **DRIVE_VOTING_FINALIZED → IN_PROGRESS**.

### 5. Action & Care (Drives Executed)

- Volunteers execute drives; evidence logged (before/after photos, trees planted).
- Reports stay **open until community marks as done**.
- Multiple drives may link to a single report.

### 6. Beautification & Monitoring

- Post-drive: murals, signage, tree guards.
- Volunteers can reference **Google, Pinterest, YouTube**.
- Monitoring lasts \~1 month:

  - ✅ If sustained → **RESOLVED**.
  - ❌ If dirty → cycle restarts at **PENDING**.

---

## **Tech Stack**

- **Frontend:** Next.js + ShadCN/UI + TailwindCSS
- **Backend:** Next.js API routes + Node.js
- **Database:** PostgreSQL (via Prisma ORM)
- **HTTP/API:** Axios or native fetch

---
