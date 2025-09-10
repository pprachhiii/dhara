"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DriveCard } from "@/components/DriveCard";
import { useAppStore } from "@/lib/stores";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { DriveStatus } from "@prisma/client";

export default function Drives() {
  const { drives, setDrives } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await fetch("/api/drives");
        if (!res.ok) throw new Error("Failed to fetch drives");
        const data: typeof drives = await res.json();
        setDrives(data);
      } catch (err) {
        console.error("Error fetching drives:", err);
      }
    };

    fetchDrives();
  }, [setDrives]);

  // Filtered & sorted drives
  const filteredDrives = drives
    .filter((drive) => {
      const matchesSearch =
        drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drive.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || drive.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "participants":
          return (b.participant ?? 0) - (a.participant ?? 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Map drive for card (if extra processing needed)
  const mapDriveForCard = (drive: typeof drives[number]) => ({
    ...drive,
    reports: drive.reports?.map((dr) => ({
      id: dr.id,
      title: dr.report.title,
      description: dr.report.description,
      reportId: dr.reportId,
      driveId: dr.driveId,
      drive: dr.drive,
      report: dr.report,
    })),
    votes: drive.votes?.map((v) => ({
      id: v.id,
      userId: v.userId,
      user: v.user,
      driveId: v.driveId,
      drive: v.drive,
      createdAt: v.createdAt,
    })),
    tasks: drive.tasks?.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      reportId: t.reportId,
      report: t.report,
      volunteerId: t.volunteerId ?? null,
      driveId: t.driveId ?? null,
      drive: t.drive ?? null,
      comfort: t.comfort,
      status: t.status,
      timeSlot: t.timeSlot ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      volunteer: t.volunteer ?? null,
    })),
    beautify: drive.beautify ?? [],
    monitorings: drive.monitorings ?? [],
  });

  const upcomingDrives = filteredDrives
    .filter((d) => d.status === DriveStatus.PLANNED)
    .map(mapDriveForCard);

  const ongoingDrives = filteredDrives
    .filter((d) => d.status === DriveStatus.ONGOING)
    .map(mapDriveForCard);

  const completedDrives = filteredDrives
    .filter((d) => d.status === DriveStatus.COMPLETED || d.status === DriveStatus.VOTING_FINALIZED)
    .map(mapDriveForCard);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community Drives</h1>
          <p className="text-muted-foreground">
            Join organized community efforts to address environmental issues
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition"
          asChild
        >
          <Link href="/drives/new">
            <Plus className="h-4 w-4 mr-2" /> Submit Drive
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drives by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(DriveStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="participants">Most Participants</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Drives */}
      {upcomingDrives.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Upcoming Drives ({upcomingDrives.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingDrives.map((drive) => (
              <DriveCard key={drive.id} drive={drive} showRegister />
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Drives */}
      {ongoingDrives.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Ongoing Drives ({ongoingDrives.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingDrives.map((drive) => (
              <DriveCard key={drive.id} drive={drive} showParticipation />
            ))}
          </div>
        </div>
      )}

      {/* Completed Drives */}
      {completedDrives.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Completed Drives ({completedDrives.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedDrives.map((drive) => (
              <DriveCard key={drive.id} drive={drive} showSummary />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDrives.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No drives found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Be the first to submit a community drive!"}
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition"
              asChild
            >
              <Link href="/drives/new">
                <Plus className="h-4 w-4 mr-2" /> Submit First Drive
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
