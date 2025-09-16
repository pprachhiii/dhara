import { create } from "zustand";
import {
  User,
  Drive,
  Task,
  TaskStatus,
  Report,
  ReportAuthority,
  DriveReport,
  DriveStatus,
  EngagementLevel,
  Vote,
} from "@/lib/types";

export interface ProposeDriveInput {
  title: string;
  description: string;
  linkedReports: string[];
  startDate: Date;
  taskBreakdown: {
    id?: string;
    title: string;
    description: string;
    comfort: EngagementLevel;
    status?: TaskStatus;
    reportId: string;
  }[];
  status: DriveStatus;
}

interface AppStore {
  currentUser: User | null;
  reports: Report[];
  drives: Drive[];

  setUser: (user: User | null) => void;
  setReports: (reports: Report[]) => void;
  setDrives: (drives: Drive[]) => void;

  fetchReports: () => Promise<void>;
  fetchDrives: () => Promise<void>;

  voteOnReport: (reportId: string) => void;
  contactAuthority: (reportId: string, authorityId: string) => void;

  voteOnDrive: (driveId: string) => void;
  signupForDrive: (driveId: string, userId: string) => void;
  proposeDrive: (input: ProposeDriveInput) => void;

  assignTaskToVolunteer: (taskId: string, volunteerId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: null,
  reports: [],
  drives: [],

  setUser: (user) => set({ currentUser: user }),
  setReports: (reports) => set({ reports }),
  setDrives: (drives) => set({ drives }),

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

  fetchDrives: async () => {
    try {
      const res = await fetch("/api/drives");
      if (!res.ok) throw new Error("Failed to fetch drives");
      const data: Drive[] = await res.json();
      set({ drives: data });
    } catch (err) {
      console.error("Error fetching drives:", err);
    }
  },

  voteOnReport: (reportId) => {
    const { currentUser, reports } = get();
    if (!currentUser) return;

    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) return;

    const alreadyVoted = targetReport.unifiedVotes?.some(
      (v) => v.userId === currentUser.id
    );
    if (alreadyVoted) return; // prevent duplicate votes

    const vote: Vote = {
      id: crypto.randomUUID(),
      reportId,
      userId: currentUser.id,
      user: currentUser,
      driveId: null,
      createdAt: new Date(),
    };

    const updatedReports = reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            unifiedVotes: [...(r.unifiedVotes ?? []), vote],
            finalVoteCount: ((r.finalVoteCount ?? 0) + 1),
          }
        : r
    );

    set({ reports: updatedReports });
  },

  contactAuthority: (reportId, authorityId) => {
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
                  authorityId,
                  status: "CONTACTED",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  volunteerId: null,
                } as ReportAuthority,
              ],
            }
          : r
      ),
    });
  },

  voteOnDrive: (driveId) => {
    const { currentUser, drives } = get();
    if (!currentUser) return;

    const targetDrive = drives.find((d) => d.id === driveId);
    if (!targetDrive) return;

    const alreadyVoted = targetDrive.unifiedVotes?.some(
      (v) => v.userId === currentUser.id
    );
    if (alreadyVoted) return; // prevent duplicate votes

    const vote: Vote = {
      id: crypto.randomUUID(),
      driveId,
      userId: currentUser.id,
      user: currentUser,
      reportId: null,
      createdAt: new Date(),
    };

    const updatedDrives = drives.map((d) =>
      d.id === driveId
        ? {
            ...d,
            unifiedVotes: [...(d.unifiedVotes ?? []), vote],
            finalVoteCount: ((d.finalVoteCount ?? 0) + 1),
          }
        : d
    );

    set({ drives: updatedDrives });
  },

  signupForDrive: (driveId, userId) => {
    const { drives } = get();
    set({
      drives: drives.map((d) =>
        d.id === driveId
          ? {
              ...d,
              tasks: [
                ...(d.tasks ?? []),
                {
                  id: crypto.randomUUID(),
                  driveId,
                  volunteerId: userId,
                  status: TaskStatus.ASSIGNED,
                  engagement: EngagementLevel.GROUP,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  title: "Assigned Task",
                  description: "Task assigned to volunteer",
                  reportId: null,
                  report: null,
                  drive: d,
                  volunteer: null,
                  timeSlot: null,
                },
              ],
            }
          : d
      ),
    });
  },

  proposeDrive: (input) => {
    const { drives, reports } = get();
    const driveId = `drive-${Date.now()}`;

    const tasks: Task[] = input.taskBreakdown.map((task, i) => {
      const report = reports.find((r) => r.id === task.reportId);
      return {
        id: task.id ?? `task-${Date.now()}-${i}`,
        driveId,
        reportId: task.reportId,
        report: report ?? null,
        title: task.title,
        description: task.description,
        engagement: task.comfort,
        status: task.status ?? TaskStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        volunteerId: null,
        volunteer: null,
        timeSlot: null,
        drive: null,
      };
    });

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
      unifiedVotes: [],
      tasks,
      enhancements: [],
      monitorings: [],
      driveVolunteers: [],
      discussions: [],
      votingOpenAt: new Date(),
      votingCloseAt: new Date(input.startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      finalVoteCount: 0,
    };

    set({ drives: [...drives, newDrive] });
  },

  assignTaskToVolunteer: (taskId, volunteerId) => {
    const { drives } = get();
    set({
      drives: drives.map((d) => ({
        ...d,
        tasks: (d.tasks ?? []).map((t) =>
          t.id === taskId
            ? { ...t, volunteerId, status: TaskStatus.ASSIGNED, updatedAt: new Date() }
            : t
        ),
      })),
    });
  },

  updateTaskStatus: (taskId, status) => {
    const { drives } = get();
    set({
      drives: drives.map((d) => ({
        ...d,
        tasks: (d.tasks ?? []).map((t) =>
          t.id === taskId ? { ...t, status, updatedAt: new Date() } : t
        ),
      })),
    });
  },
}));
