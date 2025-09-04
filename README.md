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

### 1. Report Submission

- A **citizen** submits a report about a neglected area.
- Report enters **Pending** status.

### 2. Pending Escalation

- If a report remains **Pending** for more than **7 days** without response →
  it becomes **eligible for authority contact**.

### 3. Authority Contact

- A **volunteer** contacts the relevant authority.
- Report status changes to **AUTHORITY_CONTACTED**.

### 4. Authority Escalation

- If the report remains in **AUTHORITY_CONTACTED** for more than **7 days** with no response →
  it becomes **eligible for a Drive**.

### 5. Community Voting

- Multiple eligible reports are displayed.
- The **community votes** on which reports to prioritize.
- Voting considers:

  - **Number of votes**
  - **Feasibility (availability of people, timing, etc.)**

### 6. Drive Organization

- **Top-voted reports** are scheduled for Drives.
- Each **Drive** is linked to one or more Reports.
- A Drive includes:

  - **Votes & Selection logic** (driven by community decision)
  - **Date & Time scheduling**
  - **Assigned Tasks** (matched by comfort & availability)

### 7. Task Execution

- Volunteers and community members carry out the planned Drive.
- Drives may extend over **days or even months**, depending on the scale.
- Flexibility is maintained — timelines are **community-driven**, not rigid.

### 8. Beautification & Sustained Care

- After a Drive is completed:

  - **Beautification efforts** (e.g., planting trees, painting walls, adding greenery, artwork).
  - **Preventive measures** (ensuring the area remains respected and not neglected again).

    - Example: signage, community awareness, decorations, or installing basic amenities.

  - **Monitoring period (≈1 month)** where volunteers check back to ensure upkeep.

- Goal: shift perception of the place so people value it and avoid littering/neglect.

---

## Cron Jobs

Daily check for escalation:

Move reports from Pending → Eligible for Authority Contact (if > 7 days).

Move reports from Authority Contacted → Eligible for Drive (if > 7 days).

Weekly voting aggregation (optional): finalizes votes and selects reports for Drives.

Drive reminders (optional): notify volunteers before scheduled Drives.

Post-Drive monitoring (active for 1 month):

Runs every 7 days after a Drive.

Sends reminders to volunteers to check the site and log updates.

Automatically ends after the 1-month monitoring period.

---
