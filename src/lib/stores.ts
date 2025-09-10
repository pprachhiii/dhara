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

  // NEW: proposeDrive functionality
  proposeDrive: (drive: {
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
    status: Drive['status'];
  }) => void;
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
    const updated = drives.map((d) =>
      d.id === driveId
        ? {
            ...d,
            votes: [
              ...(d.votes ?? []),
              { id: crypto.randomUUID(), driveId, userId: currentUser.id, user: currentUser, createdAt: new Date() } as DriveVote,
            ],
          }
        : d
    );
    set({ drives: updated });
  },

  signupForDrive: (driveId, userId) => {
    const { drives } = get();
    const updated = drives.map((d) =>
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
              } as Task,
            ],
          }
        : d
    );
    set({ drives: updated });
  },

  voteOnReport: (reportId) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              votes: [
                ...(r.votes ?? []),
                { id: crypto.randomUUID(), reportId, userId: "temp-user", createdAt: new Date() } as ReportVote,
              ],
            }
          : r
      ),
    })),

  contactAuthority: (reportId) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              reportAuthorities: [
                ...(r.reportAuthorities ?? []),
                { id: crypto.randomUUID(), reportId, status: "CONTACTED", createdAt: new Date() } as ReportAuthority,
              ],
            }
          : r
      ),
    })),

  // NEW: Implement proposeDrive
  proposeDrive: (newDrive) => {
    const { drives, reports } = get();
    const driveId = `drive-${Date.now()}`;

    // Create tasks with placeholder Report objects
    const tasks: Task[] = newDrive.taskBreakdown.map((t, index) => ({
      id: t.id || `task-${Date.now()}-${index}`,
      driveId,
      reportId: "", // no linked report for now
      report: {     // placeholder Report object
        id: "",
        reporterId: "",
        reporter: {} as User,
        title: t.title,
        description: t.description,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Report,
      volunteerId: null,
      volunteer: null,
      drive: null, // optional for now
      comfort: t.comfort,
      timeSlot: null,
      status: "OPEN" as TaskStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: t.description,
      title: t.title,
    }));

    // Create DriveReports with full drive and report objects
    const driveReports: DriveReport[] = newDrive.linkedReports.map((reportId) => ({
      id: `dr-${reportId}-${driveId}`,
      driveId,
      drive: {} as Drive,  // placeholder for the drive itself
      reportId,
      report: reports.find((r) => r.id === reportId) || {  // existing report or placeholder
        id: reportId,
        reporterId: "",
        reporter: {} as User,
        title: "",
        description: "",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Report,
      title: "",
      description: "",
    }));

    // Build the Drive object
    const drive: Drive = {
      id: driveId,
      title: newDrive.title,
      description: newDrive.description,
      participant: 0,
      startDate: newDrive.proposedDate,
      endDate: undefined,
      status: newDrive.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      reports: driveReports,
      votes: [],
      tasks,
      beautify: [],
      monitorings: [],
      votingOpenAt: new Date(),
      votingCloseAt: new Date(newDrive.proposedDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      finalVoteCount: 0,
    };

    // Add the new drive to the store
    set({ drives: [...drives, drive] });
  },


}));
