// ================= ENUMS =================

export type UserRole = 'USER' | 'VOLUNTEER';

export type ReportStatus =
  | 'PENDING'
  | 'AUTHORITY_CONTACTED'
  | 'READY_FOR_MONITORING'
  | 'ELIGIBLE_FOR_DRIVE'
  | 'IN_PROGRESS'
  | 'UNDER_MONITORING'
  | 'RESOLVED';

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'COMPLETED';

export type DriveStatus = 'PLANNED' | 'VOTING_FINALIZED' | 'ONGOING' | 'COMPLETED';

export type EngagementLevel = 'INDIVIDUAL' | 'PAIR' | 'GROUP';

export type EffortLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type AuthorityCategory = 'GOVERNMENT' | 'NGO' | 'COMMUNITY' | 'OTHER';

export type AuthorityRole = 'CLEANUP' | 'WASTE_MANAGEMENT';

export type ContactStatus = 'PENDING' | 'CONTACTED' | 'RESPONDED' | 'NO_RESPONSE';

export type EnhancementType = 'TREE_PLANTING' | 'MURAL_PAINTING' | 'SIGNAGE_INSTALLATION' | 'OTHER';

export type MonitoringStatus = 'ACTIVE' | 'COMPLETED' | 'ESCALATED';

export type DiscussionPhase = 'REPORT_VOTING' | 'DRIVE_VOTING' | 'GENERAL';

export type ContactMode = 'EMAIL' | 'PHONE' | 'WEBSITE' | 'SOCIAL_MEDIA' | 'IN_PERSON' | 'OTHER';

// ================= MODELS =================

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
  flags?: ReportFlag[];
}

// ---------- Volunteer ----------

export interface Volunteer {
  id: string;
  userId: string;
  user: User;

  phone?: string | null;
  joinedAt: Date;

  tasks?: Task[];
  reportAuthorities?: ReportAuthority[];
  driveVolunteers?: DriveVolunteer[];
  preferences?: VolunteerPreference | null;
  monitorings?: Monitoring[];
}

// ---------- Report ----------

export interface Report {
  id: string;

  reporterId: string;
  reporter: User;

  title: string;
  description: string;

  imageUrl?: string | null;
  media: string[];

  status: ReportStatus;

  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  pinCode?: string | null;

  landmark?: string | null;
  nearSchoolOrHospital: boolean;

  createdAt: Date;
  updatedAt: Date;

  votingOpenAt?: Date | null;
  votingCloseAt?: Date | null;
  finalVoteCount?: number | null;

  statusLogs?: StatusLog[];
  tasks?: Task[];
  reportAuthorities?: ReportAuthority[];
  drives?: DriveReport[];
  unifiedVotes?: Vote[];
  monitorings?: Monitoring[];
  discussions?: Discussion[];
  flags?: ReportFlag[];
}

// ---------- Drive ----------

export interface Drive {
  id: string;

  title: string;
  description?: string | null;

  category: string;
  participant: number;

  startDate: Date;
  endDate?: Date | null;

  durationHr: number;
  startTime: string;

  area: string;
  wardNumber?: string | null;
  city: string;
  pinCode?: string | null;
  directions?: string | null;

  status: DriveStatus;

  createdAt: Date;
  updatedAt: Date;

  votingOpenAt?: Date | null;
  votingCloseAt?: Date | null;
  finalVoteCount?: number | null;

  reports?: DriveReport[];
  tasks?: Task[];
  driveVolunteers?: DriveVolunteer[];
  discussions?: Discussion[];
  unifiedVotes?: Vote[];
  enhancements?: Enhancement[];
  monitorings?: Monitoring[];
}

// ---------- DriveReport ----------

export interface DriveReport {
  id: string;
  driveId: string;
  drive: Drive;
  reportId: string;
  report: Report;
}

// ---------- DriveVolunteer ----------

export interface DriveVolunteer {
  id: string;
  driveId: string;
  drive: Drive;
  volunteerId: string;
  volunteer: Volunteer;
  joinedAt: Date;
}

// ---------- Task ----------

export interface Task {
  id: string;

  title: string;
  description?: string | null;

  volunteersNeeded: number;

  engagement: EngagementLevel;

  driveId?: string | null;
  drive?: Drive | null;

  reportId?: string | null;
  report?: Report | null;

  volunteerId?: string | null;
  volunteer?: Volunteer | null;

  status: TaskStatus;

  createdAt: Date;
  updatedAt: Date;
}

// ---------- Enhancement ----------

export interface Enhancement {
  id: string;
  driveId: string;
  drive: Drive;

  type: EnhancementType;
  description?: string | null;
  referenceUrls: string[];

  createdAt: Date;
}

// ---------- Monitoring ----------

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

// ---------- Authority ----------

export interface Authority {
  id: string;

  name: string;
  category: AuthorityCategory;
  role: AuthorityRole;

  city: string;
  region?: string | null;

  contactMode: ContactMode;

  email?: string | null;
  phone?: string | null;
  website?: string | null;
  socialMedia?: string | null;
  address?: string | null;
  other?: string | null;

  active: boolean;

  createdAt: Date;
  updatedAt: Date;

  submittedById?: string | null;
  submittedBy?: User | null;

  reportAuthorities?: ReportAuthority[];
}

// ---------- ReportAuthority ----------

export interface ReportAuthority {
  id: string;

  reportId: string;
  report: Report;

  authorityId: string;
  authority: Authority;

  volunteerId?: string | null;
  volunteer?: Volunteer | null;

  contactMode?: ContactMode | null;
  platformDetail?: string | null;

  submittedMessage?: string | null;
  referenceId?: string | null;
  proofUrl?: string | null;
  contactedAt?: Date | null;

  status: ContactStatus;
  responseNote?: string | null;
  respondedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

// ---------- ReportFlag ----------

export interface ReportFlag {
  id: string;

  reportId: string;
  report: Report;

  userId?: string | null;
  user?: User | null;

  reason: string;
  note?: string | null;

  createdAt: Date;
}

// ---------- Discussion ----------

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

// ---------- VolunteerPreference ----------

export interface VolunteerPreference {
  id: string;

  volunteerId: string;
  volunteer: Volunteer;

  engagement: EngagementLevel;
  availability?: string | null;
  skills: string[];

  effortLevel: EffortLevel;

  updatedAt: Date;
}

// ---------- Vote ----------

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

// ---------- StatusLog ----------

export interface StatusLog {
  id: string;

  reportId: string;
  report: Report;
  status: ReportStatus;
  note?: string | null;
  createdAt: Date;
}

// ================= HELPERS =================

export type ReportWithVotes = Report & {
  unifiedVotes: Vote[];
};

export type DriveWithVotes = Drive & {
  unifiedVotes: Vote[];
};
