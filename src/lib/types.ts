// types.ts

// 🔹 Enums (mirror your Prisma enums)
export enum ReportStatus {
  PENDING = "PENDING",
  ELIGIBLE_AUTHORITY = "ELIGIBLE_AUTHORITY",
  AUTHORITY_CONTACTED = "AUTHORITY_CONTACTED",
  ELIGIBLE_DRIVE = "ELIGIBLE_DRIVE",
  VOTING_FINALIZED = "VOTING_FINALIZED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export enum TaskStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  DONE = "DONE",
}

export enum DriveStatus {
  PLANNED = "PLANNED",
  VOTING_FINALIZED = "VOTING_FINALIZED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export enum SocializingLevel {
  SOLO = "SOLO",
  DUAL = "DUAL",
  GROUP = "GROUP",
}

export enum AuthorityType {
  GOVERNMENT = "GOVERNMENT",
  NGO = "NGO",
  OTHERS = "OTHERS",
}

export enum ContactStatus {
  PENDING = "PENDING",
  CONTACTED = "CONTACTED",
  RESPONDED = "RESPONDED",
  NO_RESPONSE = "NO_RESPONSE",
}

export enum BeautifyType {
  TREE_PLANTING = "TREE_PLANTING",
  WALL_PAINTING = "WALL_PAINTING",
  SIGNAGE = "SIGNAGE",
  CLEANUP = "CLEANUP",
  OTHER = "OTHER",
}

export enum MonitoringStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ESCALATED = "ESCALATED",
}

export enum DiscussionPhase {
  REPORT_VOTING = "REPORT_VOTING",
  DRIVE_VOTING = "DRIVE_VOTING",
}

// 🔹 Interfaces (mirror your Prisma models)

export interface Report {
  id: string
  reporter: string
  title: string
  description: string
  imageUrl?: string | null
  status: ReportStatus
  eligibleAt?: Date | null
  createdAt: Date
  updatedAt: Date
  votingOpenAt?: Date | null
  votingCloseAt?: Date | null
  finalVoteCount?: number | null

  tasks?: Task[]
  reportAuthorities?: ReportAuthority[]
  drives?: DriveReport[]
  votes?: ReportVote[]
  monitorings?: Monitoring[]
}

export interface ReportVote {
  id: string
  userId: string
  reportId: string
  report?: Report
  createdAt: Date
}

export interface Task {
  id: string
  reportId: string
  report?: Report
  driveId?: string | null
  drive?: Drive | null
  volunteerId?: string | null
  volunteer?: Volunteer | null
  comfort: SocializingLevel
  timeSlot?: Date | null
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
}

export interface Drive {
  id: string
  title: string
  description?: string | null
  participant: number
  startDate: Date
  endDate?: Date | null
  status: DriveStatus
  createdAt: Date
  updatedAt: Date
  votingOpenAt?: Date | null
  votingCloseAt?: Date | null
  finalVoteCount?: number | null

  reports?: DriveReport[]
  votes?: DriveVote[]
  tasks?: Task[]
  beautify?: Beautification[]
  monitorings?: Monitoring[]
}

export interface DriveReport {
  id: string
  driveId: string
  drive?: Drive
  reportId: string
  report?: Report
}

export interface DriveVote {
  id: string
  userId: string
  driveId: string
  drive?: Drive
  createdAt: Date
}

export interface Beautification {
  id: string
  driveId: string
  drive?: Drive
  type: BeautifyType
  description?: string | null
  createdAt: Date
}

export interface Monitoring {
  id: string
  driveId?: string | null
  drive?: Drive | null
  reportId?: string | null
  report?: Report | null
  status: MonitoringStatus
  checkDate: Date
  notes?: string | null
  createdAt: Date
}

export interface Authority {
  id: string
  name: string
  type: AuthorityType
  city: string
  region?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  active: boolean
  submittedBy?: string | null
  createdAt: Date
  updatedAt: Date

  reportAuthorities?: ReportAuthority[]
}

export interface ReportAuthority {
  id: string
  reportId: string
  report?: Report
  authorityId: string
  authority?: Authority
  volunteerId?: string | null
  status: ContactStatus
  contactedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Volunteer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  joinedAt: Date

  tasks?: Task[]
}

export interface Discussion {
  id: string
  userId: string
  phase: DiscussionPhase
  content: string
  createdAt: Date
}
