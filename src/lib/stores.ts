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
} from "@/lib/types";

export interface ProposeDriveInput {
  title: string;
  description: string;
  linkedReports: string[];
  proposedDate: Date;
  taskBreakdown: {
    id: string;
    title: string;
    description: string;
    comfort: SocializingLevel;
    completed: boolean;
  }[];
  status: Drive["status"];
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
                reportId: "",
                comfort: "GROUP",
                timeSlot: null,
                status: "ASSIGNED" as TaskStatus,
                createdAt: new Date(),
                updatedAt: new Date(),
                report: {} as Report,
                volunteerId: userId,
                volunteer: null,
                drive: d,
                title: "",
                description: "",
              } as Task,
            ],
          }
        : d
    );

    set({ drives: updatedDrives });
  },

  voteOnReport: (reportId) => {
    const { reports } = get();
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
                  userId: "temp-user",
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
                  status: "CONTACTED",
                  createdAt: new Date(),
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

    const tasks: Task[] = input.taskBreakdown.map((task, index) => ({
      id: task.id || `task-${Date.now()}-${index}`,
      driveId,
      reportId: "",
      report: {
        id: "",
        reporterId: "",
        reporter: {} as User,
        title: task.title,
        description: task.description,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      volunteerId: null,
      volunteer: null,
      drive: null,
      comfort: task.comfort,
      timeSlot: null,
      status: "OPEN" as TaskStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: task.title,
      description: task.description,
    }));

    const driveReports: DriveReport[] = input.linkedReports.map((reportId) => ({
      id: `dr-${reportId}-${driveId}`,
      driveId,
      drive: {} as Drive, // placeholder
      reportId,
      report:
        reports.find((r) => r.id === reportId) ??
        ({
          id: reportId,
          reporterId: "",
          reporter: {} as User,
          title: "",
          description: "",
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Report),
      title: "",
      description: "",
    }));

    const newDrive: Drive = {
      id: driveId,
      title: input.title,
      description: input.description,
      participant: 0,
      startDate: input.proposedDate,
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
      votingCloseAt: new Date(input.proposedDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      finalVoteCount: 0,
    };

    set({ drives: [...drives, newDrive] });
  },
}));
