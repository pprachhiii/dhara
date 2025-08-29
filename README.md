# **DHARA**

**Community-driven platform for environmental stewardship and civic responsibility in India**

DHARA empowers citizens of all ages-students, professionals, homemakers, children, and the elderly-to participate in cleaning, beautifying, and maintaining neighborhoods according to their availability, comfort, and mental well-being. It combines **reporting neglected areas**, **coordinated volunteer action**, **authority contact tracking**, and **mental-health-aware task assignment** to create a practical, inclusive, and accountable environmental movement.

---

## **Key Goals and Features**

### 1. Report and Raise Awareness

- Citizens can report **dirty or neglected areas** by uploading images, videos, and descriptions.
- Each report is logged in the platform with a **unique status** (e.g., pending, authority contacted, community cleaning).

### 2. Collaborate with Authorities

- DHARA first contacts the **official cleaning authorities** responsible for the reported area.
- Volunteers can be **assigned to contact officials**.
- Buttons for:

  - **Contact Official** → logs contact and disables button if already contacted.
  - **Already Contacted** → shows the date/status of contact.

- Follow-up reminders can be simulated or automated in future versions.

### 3. Inclusive Task Assignment

- Volunteers can **choose their comfort level**: solo, low-social, or group tasks.
- Tasks are assigned accordingly, ensuring **even introverted or mentally exhausted participants** can contribute meaningfully.

### 4. Organize and Participate in Drives

- Cleaning and beautification drives are scheduled based on **community votes and availability**, maximizing participation.

### 5. Track Real Impact

- Progress is monitored using **before-and-after visuals**, **trees planted**, and **recyclables processed**, fostering accountability and long-term engagement.

### 6. Sustainability and Aesthetics

- Cleaned areas are **beautified and maintained**, promoting **pride and long-term community stewardship**.

---

## **Authority Contact Workflow**

1. Citizen reports a neglected area.
2. The system links the area to **relevant officials**.
3. Volunteers are **assigned to contact authorities**.
4. Status updates:

   - Authority responded → DHARA focuses on beautification.
   - Authority didn’t respond → community volunteers clean and escalate complaints.

---

## **Hackathon / MVP Scope**

- Fully implemented: reporting areas, authority contact simulation, task assignment based on comfort, status tracking, basic UI to show lists and progress.
- Simulated / demo-only: real emails/notifications to authorities, waiting for actual response, full analytics dashboards.
- Future expansion: automated authority notifications, AI-based task recommendations, real-world cleanup scheduling, real-time impact dashboards.

---

## **Tech Stack**

- **Frontend:** Next.js + ShadCN/UI + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Database:** PostgreSQL (with Prisma ORM)
- **HTTP/API:** Axios or native fetch for frontend-backend communication

---

## **Workflow Overview**

1. Report neglected area → attach image/video + description.
2. Authority contact → assigned volunteer contacts official; status updated.
3. Volunteer task assignment → based on comfort level (solo/low-social/group).
4. Cleaning/beautification drives → scheduled via community votes.
5. Track impact → before/after visuals, trees planted, recyclables processed.

---
