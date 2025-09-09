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
                { id: crypto.randomUUID(), reportId, userId: "temp-user", createdAt: new Date() } as Partial<ReportVote>,
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
                { id: crypto.randomUUID(), reportId, status: "CONTACTED", createdAt: new Date() } as Partial<ReportAuthority>,
              ] as ReportAuthority[],
            }
          : r
      ),
    })),
}));
