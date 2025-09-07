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

## **Tech Stack**

- **Frontend:** Next.js + ShadCN/UI + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Database:** PostgreSQL (with Prisma ORM)
- **HTTP/API:** Axios or native fetch for frontend-backend communication

---

# UserFlow

## **1. Report Phase (Citizen → System)**

- Citizen submits report (photo/video + description).
- Status: **Pending**.
- ⏳ After 7 days → **Eligible for Authority Contact**.

---

## **2. Authority Contact Phase (Volunteer → Authority)**

- Volunteers see **Contact Official** button (authority details shown).
- When clicked → system logs **volunteer name + date**.
- Status → **Authority Contacted**.

⏳ After 7 more days:

- ✅ If authority resolves → **Resolved by Authority** → move to Beautification/Monitoring.
- ❌ If no response → **Eligible for Community Voting**.

---

## **3. Centralized Report Voting Phase (Community → System)**

- **All reports that became Eligible for Drive** appear together in **one voting hub**.
- **Community does not discuss per report** — instead, there’s an **overall voting discussion space** where people:

  - Advocate for priority areas.
  - Suggest why certain reports deserve earlier action.
  - Flag constraints (e.g., accessibility, urgency, safety).

**Voting Window:**

- Opens when reports hit eligibility.
- Lasts **7 days** (`votingOpenAt` → `votingCloseAt`).

**When Voting Ends:**

- Votes freeze.
- Top reports move to **In Progress** → Drive creation begins.

---

## **4. Drive Creation & Centralized Drive Voting Phase**

- Once reports are **In Progress**, volunteers propose **specific Drives** (cleanup, tree planting, phased actions).

- **All proposed Drives are listed in a shared Drive Voting Hub**.

- Each Drive has:

  - Linked reports.
  - Proposed date/time.
  - Suggested task breakdown.

- **Discussion happens at the Drive Voting Hub level**:

  - Coordination of logistics (_“I’ll bring gloves”_, _“North gate is better meeting point”_).
  - General availability talks.

**Voting Window:**

- 7 days for each Drive proposal.

**When Voting Ends:**

- Highest-supported Drive(s) get **finalized** → status: **Planned → Ongoing**.
- Volunteers notified.

---

## **5. Action & Care Phase**

- Drive executed.

- Evidence logged (before/after pics, collected waste, planted trees).

- Status: **Drive Completed (linked back to reports)**.

- Reports stay **Open** until the community marks them “done.”

- Multiple Drives can attach to the same report.

---

## **6. Beautification & Monitoring Phase**

- After Drives:

  - Beautification projects (murals, signage, tree guards).
  - Monitoring for \~1 month.

- ✅ If clean → **Sustained**.

- ❌ If dirty again → cycle restarts at Report Phase.

---

# **Where Discussions Happen (Centralized)**

1. **Report Voting Hub** → one discussion thread for prioritization (not per report).
2. **Drive Voting Hub** → one discussion thread for coordination (not per drive).

👉 This keeps voting and talking **simple, transparent, and collective**.

---

## Cron Jobs (Adjusted for Centralization)

- Daily:

  - Move reports across phases (Pending → Eligible, etc.).
  - Auto-close report voting after 7 days.
  - Auto-close drive voting after 7 days.

- Weekly:

  - Summarize report votes + finalize drive priorities.

- Before Drives:

  - Remind volunteers of upcoming drives.

- After Drives:

  - Weekly monitoring reminders until 1 month ends.

---
