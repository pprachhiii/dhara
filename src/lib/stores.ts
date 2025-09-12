import { create } from "zustand";
import {
  User,
  Drive,
  DriveVote,
  Task,
  TaskStatus,
  Report,
  ReportVote,
  ReportAuthority,
  SocializingLevel,
  DriveReport,
  DriveStatus,
} from "@/lib/types";

export interface ProposeDriveInput {
  title: string;
  description: string;
  linkedReports: string[]; // reportIds
  startDate: Date;         // ✅ was proposedDate
  taskBreakdown: {
    id?: string;
    title: string;
    description: string;
    comfort: SocializingLevel;
    status?: TaskStatus;  
    reportId: string;      
  }[];
  status: DriveStatus;
}

interface AppStore {
  currentUser: User | null;
  drives: Drive[];
  reports: Report[];

  setUser: (user: User | null) => void;
  setDrives: (drives: Drive[]) => void;
  setReports: (reports: Report[]) => void;
  fetchReports: () => Promise<void>;

  voteOnDrive: (driveId: string) => void;
  signupForDrive: (driveId: string, userId: string) => void;

  voteOnReport: (reportId: string) => void;
  contactAuthority: (reportId: string) => void;

  proposeDrive: (drive: ProposeDriveInput) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: null,
  drives: [],
  reports: [],

  setUser: (user) => set({ currentUser: user }),
  setDrives: (drives) => set({ drives }),
  setReports: (reports) => set({ reports }),

  fetchReports: async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data: Report[] = await res.json();
      set({ reports: data });
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  },

  voteOnDrive: (driveId) => {
    const { drives, currentUser } = get();
    if (!currentUser) return;

    const updatedDrives = drives.map((d) =>
      d.id === driveId
        ? {
            ...d,
            votes: [
              ...(d.votes ?? []),
              {
                id: crypto.randomUUID(),
                driveId,
                userId: currentUser.id,
                user: currentUser,
                createdAt: new Date(),
              } as DriveVote,
            ],
          }
        : d
    );

    set({ drives: updatedDrives });
  },

  signupForDrive: (driveId, userId) => {
    const { drives } = get();
    const updatedDrives = drives.map((d) =>
      d.id === driveId
        ? {
            ...d,
            tasks: [
              ...(d.tasks ?? []),
              {
                id: crypto.randomUUID(),
                driveId,
                reportId: d.reports && d.reports.length > 0 ? d.reports[0].reportId ?? "" : "", // pick a report from drive
                comfort: "GROUP",
                timeSlot: null,
                status: "ASSIGNED" as TaskStatus,
                createdAt: new Date(),
                updatedAt: new Date(),
                title: "",
                description: "",
                report: d.reports && d.reports.length > 0 ? d.reports[0]?.report ?? ({} as Report) : ({} as Report),
                volunteerId: userId,
                volunteer: null,
                drive: d,
              } as Task,
            ],
          }
        : d
    );

    set({ drives: updatedDrives });
  },

  voteOnReport: (reportId) => {
    const { reports, currentUser } = get();
    if (!currentUser) return;
    set({
      reports: reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              votes: [
                ...(r.votes ?? []),
                {
                  id: crypto.randomUUID(),
                  reportId,
                  userId: currentUser.id,
                  user: currentUser,
                  createdAt: new Date(),
                } as ReportVote,
              ],
            }
          : r
      ),
    });
  },

  contactAuthority: (reportId) => {
    const { reports } = get();
    set({
      reports: reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              reportAuthorities: [
                ...(r.reportAuthorities ?? []),
                {
                  id: crypto.randomUUID(),
                  reportId,
                  authorityId: "temp-authority",
                  status: "CONTACTED",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as ReportAuthority,
              ],
            }
          : r
      ),
    });
  },

  proposeDrive: (input) => {
    const { drives, reports } = get();
    const driveId = `drive-${Date.now()}`;

    // build tasks
    const tasks: Task[] = input.taskBreakdown.map((task, i) => {
      const report = reports.find((r) => r.id === task.reportId);
      return {
        id: task.id ?? `task-${Date.now()}-${i}`,
        driveId,
        reportId: task.reportId,
        report: report ?? ({} as Report),
        title: task.title,
        description: task.description,
        comfort: task.comfort,
        timeSlot: null,
        status: task.status ?? TaskStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        volunteerId: null,
        volunteer: null,
        drive: null,
      };
    });

    // build drive-reports
    const driveReports: DriveReport[] = input.linkedReports.map((reportId) => {
      const report = reports.find((r) => r.id === reportId);
      return {
        id: `dr-${reportId}-${driveId}`,
        driveId,
        reportId,
        drive: {} as Drive,
        report: report ?? ({} as Report),
        title: report?.title ?? "",
        description: report?.description ?? "",
      };
    });

    const newDrive: Drive = {
      id: driveId,
      title: input.title,
      description: input.description,
      participant: 0,
      startDate: input.startDate,
      endDate: undefined,
      status: input.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      reports: driveReports,
      votes: [],
      tasks,
      beautify: [],
      monitorings: [],
      votingOpenAt: new Date(),
      votingCloseAt: new Date(input.startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      finalVoteCount: 0,
    };

    set({ drives: [...drives, newDrive] });
  },
}));
