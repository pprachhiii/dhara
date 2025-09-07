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
} from "@/lib/types";

// --------------- Store shape ---------------
interface AppStore {
  // 🔹 User + drives (for DriveCard)
  currentUser: User | null;
  drives: Drive[];

  voteOnDrive: (driveId: string) => void;
  signupForDrive: (driveId: string, userId: string) => void;

  setUser: (user: User | null) => void;
  setDrives: (drives: Drive[]) => void;

  // 🔹 Reports (your existing part)
  reports: Report[];
  voteOnReport: (reportId: string) => void;
  contactAuthority: (reportId: string) => void;
}

// --------------- Zustand store ---------------
export const useAppStore = create<AppStore>((set, get) => ({
  // ----------- drives + user -----------
  currentUser: null,
  drives: [],

  setUser: (user) => set({ currentUser: user }),
  setDrives: (drives) => set({ drives }),

  voteOnDrive: (driveId) => {
    const { drives, currentUser } = get();
    if (!currentUser) return;

    const updated = drives.map((drive) =>
      drive.id === driveId
        ? {
            ...drive,
            votes: [
              ...(drive.votes ?? []),
              {
                id: crypto.randomUUID(),
                driveId,
                userId: currentUser.id,
                user: currentUser,
                createdAt: new Date(),
              } as DriveVote,
            ],
          }
        : drive
    );

    set({ drives: updated });
  },

  signupForDrive: (driveId, userId) => {
    const { drives } = get();

    const updated = drives.map((drive) => {
      if (drive.id !== driveId) return drive;

      const newTask: Task = {
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
        drive,
      };

      return {
        ...drive,
        tasks: [...(drive.tasks ?? []), newTask],
      };
    });

    set({ drives: updated });
  },

  // ----------- reports -----------
  reports: [],

  voteOnReport: (reportId) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              votes: [
                ...(r.votes ?? []),
                {
                  id: Math.random().toString(),
                  userId: "temp-user",
                  reportId: r.id,
                  createdAt: new Date(),
                } as Partial<ReportVote>, // mark as partial to avoid strictness
              ] as ReportVote[],
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
                {
                  id: Math.random().toString(),
                  reportId: r.id,
                  status: "CONTACTED",
                  createdAt: new Date(),
                } as Partial<ReportAuthority>, // mark as partial
              ] as ReportAuthority[],
            }
          : r
      ),
    })),
}));
