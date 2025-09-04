
export type Report = {
  id: string;
  reporter: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  eligibleAt?: string; // DateTime serialized as string
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  reportAuthorities?: ReportAuthority[];
  drives?: DriveReport[];
  votes?: ReportVote[];
  monitorings?: Monitoring[];
};

export type ReportVote = {
  id: string;
  userId: string;
  reportId: string;
  createdAt: string;
};

export type Task = {
  id: string;
  reportId: string;
  driveId?: string;
  volunteerId?: string;
  comfort: SocializingLevel;
  timeSlot?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type Drive = {
  id: string;
  title: string;
  description?: string;
  participant: number;
  startDate: string;
  endDate?: string;
  status: DriveStatus;
  createdAt: string;
  updatedAt: string;
  reports?: DriveReport[];
  votes?: Vote[];
  tasks?: Task[];
  beautify?: Beautification[];
  monitorings?: Monitoring[];
};

export type DriveReport = {
  id: string;
  driveId: string;
  reportId: string;
};

export type Vote = {
  id: string;
  userId: string;
  driveId: string;
  createdAt: string;
};

export type Beautification = {
  id: string;
  driveId: string;
  type: BeautifyType;
  description?: string;
  createdAt: string;
};

export type Monitoring = {
  id: string;
  driveId?: string;
  reportId?: string;
  status: MonitoringStatus;
  checkDate: string;
  notes?: string;
  createdAt: string;
};

export type Authority = {
  id: string;
  name: string;
  type: AuthorityType;
  city: string;
  region?: string;
  email?: string;
  phone?: string;
  website?: string;
  active: boolean;
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportAuthority = {
  id: string;
  reportId: string;
  authorityId: string;
  volunteer?: string;
  status: ContactStatus;
  contactedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Volunteer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  joinedAt: string;
  tasks?: Task[];
};

// Enums
export enum ReportStatus {
  PENDING = "PENDING",
  ELIGIBLE_AUTHORITY = "ELIGIBLE_AUTHORITY",
  AUTHORITY_CONTACTED = "AUTHORITY_CONTACTED",
  ELIGIBLE_DRIVE = "ELIGIBLE_DRIVE",
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
