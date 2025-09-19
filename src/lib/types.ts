// ----------------- Enums -----------------
export type UserRole = "USER" | "VOLUNTEER";

export type ReportStatus =
  | "PENDING"
  | "AUTHORITY_CONTACTED"
  | "RESOLVED_BY_AUTHORITY"
  | "ELIGIBLE_FOR_VOTE"
  | "VOTING_FINALIZED"
  | "ELIGIBLE_FOR_DRIVE"
  | "DRIVE_FINALIZED"
  | "IN_PROGRESS"
  | "UNDER_MONITORING"
  | "RESOLVED";

export enum TaskStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  COMPLETED = "COMPLETED"
}

export type DriveStatus = "PLANNED" | "VOTING_FINALIZED" | "ONGOING" | "COMPLETED";

export enum EngagementLevel {
  INDIVIDUAL = "INDIVIDUAL",
  PAIR = "PAIR",
  GROUP = "GROUP"
}

export enum EffortLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export enum AuthorityCategory {
  GOVERNMENT = "GOVERNMENT",
  NGO = "NGO",
  COMMUNITY = "COMMUNITY",
  OTHER = "OTHER"
}

export enum AuthorityRole {
  CLEANUP = "CLEANUP",
  WASTE_MANAGEMENT = "WASTE_MANAGEMENT"
}

export type ContactStatus = "PENDING" | "CONTACTED" | "RESPONDED" | "NO_RESPONSE";

export enum EnhancementType {
  TREE_PLANTING = "TREE_PLANTING",
  MURAL_PAINTING = "MURAL_PAINTING",
  SIGNAGE_INSTALLATION = "SIGNAGE_INSTALLATION",
  CLEANUP_ACTIVITY = "CLEANUP_ACTIVITY",
  OTHER = "OTHER"
}

export type MonitoringStatus = "ACTIVE" | "COMPLETED" | "ESCALATED";

export type DiscussionPhase = "REPORT_VOTING" | "DRIVE_VOTING" | "GENERAL";

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

  votes?: Vote[];
  discussions?: Discussion[];
  volunteer?: Volunteer | null;
  reports?: Report[];
  submittedAuthorities?: Authority[];
}

export interface Volunteer {
  id: string;
  userId: string;
  user: User;
  phone?: string | null;
  tasks?: Task[];
  joinedAt: Date;
  reportAuthorities?: ReportAuthority[];
  driveVolunteers?: DriveVolunteer[];
  preferences?: VolunteerPreference | null;
  monitorings?: Monitoring[];
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: User;
  title: string;
  description: string;
  imageUrl?: string | null;
  media?: string[];
  status: ReportStatus;

  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  pinCode?: string | null;

  createdAt: Date;
  updatedAt: Date;

  tasks?: Task[];
  reportAuthorities?: ReportAuthority[];
  drives?: DriveReport[];
  unifiedVotes?: Vote[];
  monitorings?: Monitoring[];
  discussions?: Discussion[];
  votingOpenAt?: Date | null;
  votingCloseAt?: Date | null;
  finalVoteCount?: number | null;
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
  unifiedVotes?: Vote[];
  tasks?: Task[];
  enhancements?: Enhancement[];
  monitorings?: Monitoring[];
  driveVolunteers?: DriveVolunteer[];
  discussions?: Discussion[];
}

export interface DriveReport {
  id: string;
  driveId: string;
  drive: Drive;
  reportId: string;
  report: Report;
}

export interface DriveVolunteer {
  id: string;
  driveId: string;
  drive: Drive;
  volunteerId: string;
  volunteer: Volunteer;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reportId?: string | null;
  report?: Report | null;
  driveId?: string | null;
  drive?: Drive | null;
  volunteerId?: string | null;
  volunteer?: Volunteer | null;
  engagement: EngagementLevel;
  timeSlot?: Date | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enhancement {
  id: string;
  driveId: string;
  drive: Drive;
  type: EnhancementType;
  description?: string | null;
  referenceUrls?: string[];
  createdAt: Date;
}

export interface Monitoring {
  id: string;
  driveId?: string | null;
  drive?: Drive | null;
  reportId?: string | null;
  report?: Report | null;
  volunteerId?: string | null;
  volunteer?: Volunteer | null;
  status: MonitoringStatus;
  checkDate: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface Authority {
  id: string;
  name: string;
  category: AuthorityCategory;
  role: AuthorityRole;
  city: string;
  region?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  submittedBy?: User | null;
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
  reportId?: string | null;
  report?: Report | null;
  driveId?: string | null;
  drive?: Drive | null;
  createdAt: Date;
}

export interface VolunteerPreference {
  id: string;
  volunteerId: string;
  volunteer: Volunteer;
  engagement: EngagementLevel;
  availability?: string | null;
  skills?: string[];
  effortLevel: EffortLevel;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  user: User;
  reportId?: string | null;
  report?: Report | null;
  driveId?: string | null;
  drive?: Drive | null;
  createdAt: Date;
}

export interface ReportWithVotes extends Report {
  votes: Vote[];
}

export type DriveWithVotes = Drive & {
  unifiedVotes: Vote[];
};