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

# Useflow

## **1. Report Phase (Citizen → System)**

- Citizen submits report (photo/video + description).
- Status: **Pending**.

⏳ After 7 days → **Eligible for Authority Contact**.

---

## **2. Authority Contact Phase (Volunteer → Authority)**

- Report shows **Contact Official button** (with authority details like phone/email).
- When clicked → popup: _“Did you contact the official?”_ → volunteer confirms, system logs **name + date**.
- Status → **Authority Contacted**.

⏳ After 7 more days:

- ✅ Authority responded → Status: **Resolved by Authority** → jump to Beautification/Monitoring.
- ❌ No response → Status: **Eligible for Drive**.

---

## **3. Community Voting Phase (Reports) (Community → System)**

- Reports that are **Eligible for Drive** appear in the **report voting list**.
- Community members can:

  - **Vote** on which reports deserve action first.
  - **Add a short discussion comment** (ideas, suggestions, reasons for supporting, availability notes).

**Voting Window:**

- Starts immediately when report becomes **Eligible for Drive**.
- Open for **7 days**.
- `votingOpenAt` = now, `votingCloseAt` = now + 7 days.

**When Voting Ends:**

- Votes are frozen.
- Reports with enough community support move to **In Progress**.
- Status: **In Progress (Drive Scheduling can begin)**.

---

## **4. Drive Creation & Voting Phase (Community → System)**

- Once a report is **In Progress**, community members can **propose specific Drives**.
- One report → may have **multiple Drives** (phased cleanups or recurring efforts).

Each **proposed Drive** includes:

- Report(s) linked
- Tentative Date & Time (community-chosen)
- Task assignments (solo / low-social / group, based on volunteer comfort & availability)
- **Drive-specific discussion space** for coordination (_“I can bring gloves”_, _“Let’s meet at the north gate”_).

**Drive Voting Window:**

- Opens immediately when a Drive is proposed.
- Open for **7 days**.
- `votingOpenAt` = now, `votingCloseAt` = now + 7 days.

**When Voting Ends:**

- Votes are frozen.
- Drive with highest support is **finalized** (status: **Planned → Voting Finalized → Ongoing**).
- Volunteers notified to prepare.

---

## **5. Action & Care Phase (Volunteers → Area)**

- Drive executed → before/after pics, collected waste, trees planted, etc.
- Status: **Drive Completed (linked to report)**.

🔁 Since **multiple Drives can attach to one report**:

- Report stays **Open** until the community marks it “done.”
- Closure happens only after the last Drive + monitoring.

---

## **6. Beautification & Monitoring Phase**

- After Drives:

  - Beautification (murals, trees, signage).
  - Monitoring for \~1 month (weekly check-ins logged).

- ✅ If clean → Status: **Sustained**.

- ❌ If dirty again → loop back to **Report Phase**.

---

# **Visual Lifecycle (with Discussions & Voting)**

1. **Report (Pending)** →

2. **Authority Contact Eligible** →

   - Volunteer logs contact → **Authority Contacted**
   - ✅ Authority resolves → **Resolved by Authority**
   - ❌ No response → **Eligible for Drive**

3. **Report Voting (7 days)** → report finalized → Status: **In Progress**

4. **Drive Proposals + Drive Voting (7 days each)** → finalized into **Drive(s)**

   - One report → many Drives
   - Each drive has its own voting + discussion cycle

5. **Drives Executed → Beautification → Monitoring (1 month)** →

   - ✅ Sustained OR
   - 🔁 Back to Report

---

# **Where Discussions Fit in**

- **At Report Voting** → people explain _why_ a site deserves action.
- **At Drive Voting/Setup** → volunteers coordinate practicals (time, materials, roles).
- Keeps it transparent + collaborative, but still structured.

---

## Cron Jobs

**Daily checks:**

- Move reports from Pending → Eligible for Authority Contact (if > 7 days).
- Move reports from Authority Contacted → Eligible for Drive (if > 7 days).
- Close report voting when `votingCloseAt < now()`.
- Close drive voting when `votingCloseAt < now()`.

**Weekly aggregation (optional):**

- Summarize report votes + finalize priorities.

**Drive reminders (optional):**

- Notify volunteers before scheduled Drives.

**Post-Drive monitoring (1 month):**

- Runs every 7 days after a Drive.
- Sends reminders to volunteers to log updates.
- Automatically ends after 1-month monitoring.

---
