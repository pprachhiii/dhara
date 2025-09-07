// ----------------- Enums -----------------

export type UserRole = "USER" | "VOLUNTEER";
export type ReportStatus =
  | "PENDING"
  | "ELIGIBLE_AUTHORITY"
  | "AUTHORITY_CONTACTED"
  | "ELIGIBLE_DRIVE"
  | "VOTING_FINALIZED"
  | "IN_PROGRESS"
  | "RESOLVED";
export type TaskStatus = "OPEN" | "ASSIGNED" | "DONE";
export type DriveStatus = "PLANNED" | "VOTING_FINALIZED" | "ONGOING" | "COMPLETED";
export type SocializingLevel = "SOLO" | "DUAL" | "GROUP";
export type AuthorityType = "GOVERNMENT" | "NGO" | "OTHERS";
export type ContactStatus = "PENDING" | "CONTACTED" | "RESPONDED" | "NO_RESPONSE";
export type BeautifyType = "TREE_PLANTING" | "WALL_PAINTING" | "SIGNAGE" | "CLEANUP" | "OTHER";
export type MonitoringStatus = "ACTIVE" | "COMPLETED" | "ESCALATED";
export type DiscussionPhase = "REPORT_VOTING" | "DRIVE_VOTING";

// ----------------- Models -----------------

export interface User {
  id: string;
  email: string;
  name?: string | null;
  password?: string | null;
  role: UserRole;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  reportVotes?: ReportVote[];
  driveVotes?: DriveVote[];
  discussions?: Discussion[];
  volunteer?: Volunteer | null;
  reports?: Report[];
}

export interface Volunteer {
  id: string;
  userId: string;
  user: User;
  phone?: string | null;
  tasks?: Task[];
  joinedAt: Date;
  reportAuthorities?: ReportAuthority[];
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: User;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: ReportStatus;
  eligibleAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  votingOpenAt?: Date | null;
  votingCloseAt?: Date | null;
  finalVoteCount?: number | null;

  tasks?: Task[];
  reportAuthorities?: ReportAuthority[];
  drives?: DriveReport[];
  votes?: ReportVote[];
  monitorings?: Monitoring[];
}

export interface ReportVote {
  id: string;
  userId: string;
  user: User;
  reportId: string;
  report: Report;
  createdAt: Date;
}

export interface Drive {
  id: string;
  title: string;
  description?: string | null;
  participant: number;
  startDate: Date;
  endDate?: Date | null;
  status: DriveStatus;
  createdAt: Date;
  updatedAt: Date;

  votingOpenAt?: Date | null;
  votingCloseAt?: Date | null;
  finalVoteCount?: number | null;

  reports?: DriveReport[];
  votes?: DriveVote[];
  tasks?: Task[];
  beautify?: Beautification[];
  monitorings?: Monitoring[];
}

export interface DriveReport {
  id: string;
  driveId: string;
  drive: Drive;
  reportId: string;
  report: Report;
}

export interface DriveVote {
  id: string;
  userId: string;
  user: User;
  driveId: string;
  drive: Drive;
  createdAt: Date;
}

export interface Task {
  id: string;
  reportId: string;
  report: Report;
  driveId?: string | null;
  drive?: Drive | null;
  volunteerId?: string | null;
  volunteer?: Volunteer | null;
  comfort: SocializingLevel;
  timeSlot?: Date | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Beautification {
  id: string;
  driveId: string;
  drive: Drive;
  type: BeautifyType;
  description?: string | null;
  createdAt: Date;
}

export interface Monitoring {
  id: string;
  driveId?: string | null;
  drive?: Drive | null;
  reportId?: string | null;
  report?: Report | null;
  status: MonitoringStatus;
  checkDate: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface Authority {
  id: string;
  name: string;
  type: AuthorityType;
  city: string;
  region?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  reportAuthorities?: ReportAuthority[];
}

export interface ReportAuthority {
  id: string;
  reportId: string;
  report: Report;
  authorityId: string;
  authority: Authority;
  volunteerId?: string | null;
  volunteer?: Volunteer | null;
  status: ContactStatus;
  contactedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discussion {
  id: string;
  userId: string;
  user: User;
  phase: DiscussionPhase;
  content: string;
  createdAt: Date;
}
