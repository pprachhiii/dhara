export type ReportStatus = "PENDING" | "AUTHORITY_CONTACTED" | "IN_PROGRESS" | "RESOLVED";
export type TaskStatus = "OPEN" | "ASSIGNED" | "DONE";
export type SocializingLevel = "SOLO" | "DUAL" | "GROUP";
export type AuthorityType = "GOVERNMENT" | "NGO" | "OTHERS";
export type ContactStatus = "PENDING" | "CONTACTED" | "RESPONDED" | "NO_RESPONSE";

// Entities
export type Report = {
  id: string;
  reporter: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  tasks: Task[];
  reportAuthorities: ReportAuthority[];
};

export type Task = {
  id: string;
  reportId: string;
  comfort: SocializingLevel;
  assignedTo?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type Drive = {
  id: string;
  participant: number;
  date: string; // ISO string
  title: string;
  description?: string;
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
  reportAuthorities: ReportAuthority[];
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
  report?: Report;
  authority?: Authority;
};
