export type ReportStatus = "PENDING" | "AUTHORITY_CONTACTED" | "IN_PROGRESS" | "RESOLVED";
export type TaskStatus = "OPEN" | "ASSIGNED" | "DONE";
export type SocializingLevel = "SOLO" | "DUAL" | "GROUP";

// Entities
export type Report = {
  id: string;
  reporter: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  createdAt: string; 
  updatedAt: string;
  tasks: Task[];
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
  date: string;
  title: string;
  description?: string;
  createdAt: string;
};
