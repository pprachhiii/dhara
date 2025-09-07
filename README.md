# **DHARA**

**Community-driven platform for environmental stewardship and civic responsibility in India**

DHARA empowers citizens of all ages-students, professionals, homemakers, children, and the elderly-to actively participate in cleaning, beautifying, and maintaining neighborhoods. Participation is flexible and aligned with people’s availability, comfort, and mental well-being.

The platform integrates **reporting neglected areas**, **coordinated volunteer action**, **authority contact tracking**, and **mental-health-aware task assignment** into a practical, inclusive, and accountable environmental movement.

---

## **Key Goals and Features**

### 1. Report and Raise Awareness

- Citizens can report **dirty or neglected areas** by uploading images, videos, and descriptions.
- Each report is logged in the platform with a **unique status** (e.g., Pending, Authority Contacted, Community Cleaning).

### 2. Collaborate with Authorities

- DHARA first contacts the **official cleaning authorities** responsible for the reported area.
- Volunteers can be **assigned to contact officials**.
- Buttons for:

  - **Contact Official** → logs contact and disables button if already contacted.
  - **Already Contacted** → shows the date/status of contact.

- Follow-up reminders may be simulated or automated in future versions.

### 3. Inclusive Task Assignment

- Volunteers select their **comfort level**: solo, low-social, or group tasks.
- Assignments are made accordingly, ensuring even **introverted or mentally exhausted participants** can contribute meaningfully.

### 4. Organize and Participate in Drives

- Cleaning and beautification drives are scheduled based on **community votes and availability**, maximizing participation.

### 5. Track Real Impact

- Progress tracked with:

  - **Before-and-after visuals**
  - **Trees planted**
  - **Recyclables processed**

- Fosters accountability and long-term engagement.

### 6. Sustainability and Aesthetics

- Cleaned areas are **beautified and maintained**, promoting **pride and long-term community stewardship**.

---

## **Authority Contact Workflow**

1. Citizen reports a neglected area.
2. System links the area to **relevant officials**.
3. Volunteers are **assigned to contact authorities**.
4. Status updates:

   - ✅ Authority responded → DHARA focuses on beautification.
   - ❌ Authority didn’t respond → community volunteers clean and escalate complaints.

---

## **Tech Stack**

- **Frontend:** Next.js + ShadCN/UI + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Database:** PostgreSQL (via Prisma ORM)
- **HTTP/API:** Axios or native fetch

---

# **UserFlow**

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

- **All reports that became Eligible for Drive** appear together in a **single voting hub**.
- **One central discussion thread** (not per report) for:

  - Advocating priority areas.
  - Explaining why certain reports deserve earlier action.
  - Flagging constraints (safety, accessibility, urgency).

**Voting Window:**

- Opens when reports hit eligibility.
- Lasts **7 days** (`votingOpenAt` → `votingCloseAt`).

**When Voting Ends:**

- Votes freeze.
- Top reports move to **In Progress** → Drive creation begins.

---

## **4. Drive Creation & Centralized Drive Voting Phase**

- Reports marked **In Progress** lead to volunteer-proposed **Drives** (cleanup, tree planting, phased actions).
- Drives are listed in a **shared Drive Voting Hub** with:

  - Linked reports
  - Proposed date/time
  - Suggested task breakdown

**Drive Discussion (centralized):**

- Logistics (_“I’ll bring gloves”_, _“North gate is better”_)
- General availability

**Voting Window:**

- 7 days for each Drive proposal.

**When Voting Ends:**

- Highest-supported Drives are **finalized** → Status: **Planned → Ongoing**.
- Volunteers notified.

---

## **5. Action & Care Phase**

- Drive executed.
- Evidence logged (before/after pics, collected waste, planted trees).
- Status: **Drive Completed (linked back to reports)**.
- Reports remain **Open** until marked “done” by the community.
- Multiple Drives may attach to the same report.

---

## **6. Beautification & Monitoring Phase**

- After Drives:

  - Beautification projects (murals, signage, tree guards).
  - Monitoring for \~1 month.

- ✅ If clean → **Sustained**.

- ❌ If dirty again → cycle restarts at **Report Phase**.

---

# **Where Discussions Happen (Centralized)**

1. **Report Voting Hub** → single discussion thread for prioritization.
2. **Drive Voting Hub** → single discussion thread for coordination.

👉 Keeps voting and talking **simple, transparent, and collective**.

---

## **Cron Jobs (Centralized Workflow)**

- **Daily**

  - Move reports across phases (Pending → Eligible, etc.)
  - Auto-close report voting after 7 days
  - Auto-close drive voting after 7 days

- **Weekly**

  - Summarize report votes
  - Finalize drive priorities

- **Before Drives**

  - Remind volunteers of upcoming drives

- **After Drives**

  - Weekly monitoring reminders until 1 month ends

---
