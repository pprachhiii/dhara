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
import { ReportCard } from "@/components/ReportCard";
import { useAppStore } from "@/lib/stores";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { ReportStatus, TaskStatus, SocializingLevel } from "@prisma/client";
import { ReportDetailPage } from "@/components/ReportDetailedPage";
import { Report } from "@/lib/types";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { reports, setReports } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data: Report[] = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };

    fetchReports();
  }, [setReports]);

  const filteredReports = reports
    .filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "votes":
          return (b.votes?.length ?? 0) - (a.votes?.length ?? 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const mapReportForCard = (report: Report) => ({
    ...report,
    votes: report.votes?.map((v) => ({
      id: v.id,
      userId: v.userId,
      user: v.user,
      reportId: v.reportId,
      report: v.report,
      createdAt: v.createdAt,
    })),
    tasks: report.tasks?.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      volunteerId: t.volunteerId ?? null,
      reportId: t.reportId,
      report: t.report,
      comfort: t.comfort ?? SocializingLevel.SOLO,
      status: t.status ?? TaskStatus.OPEN,
      timeSlot: t.timeSlot ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      driveId: t.driveId ?? null,
      drive: t.drive ?? null,
      volunteer: t.volunteer ?? null,
    })),
    reportAuthorities: report.reportAuthorities?.map((ra) => ({
      id: ra.id,
      reportId: ra.reportId,
      report: ra.report,
      authorityId: ra.authorityId,
      authority: ra.authority,
      volunteerId: ra.volunteerId ?? null,
      volunteer: ra.volunteer ?? null,
      contactedAt: ra.contactedAt ?? null,
      status: ra.status,
      createdAt: ra.createdAt,
      updatedAt: ra.updatedAt,
    })),
  });

  const votingReports = filteredReports.filter(
    (r) => r.status === ReportStatus.ELIGIBLE_DRIVE
  );
  const authorityContactReports = filteredReports;
  const otherReports = filteredReports.filter(
    (r) => r.status !== ReportStatus.ELIGIBLE_DRIVE
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community Reports</h1>
          <p className="text-muted-foreground">
            Track environmental issues and community initiatives across India
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition"
          asChild
        >
          <Link href="/reports/new">
            <Plus className="h-4 w-4 mr-2" /> Submit Report
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title or description..."
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
            {Object.values(ReportStatus).map((status) => (
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
            <SelectItem value="votes">Most Voted</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voting Hub */}
      {votingReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Community Voting Hub ({votingReports.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            These reports need community votes to proceed to action phase.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {votingReports.map((report) => (
              <ReportCard
                key={report.id}
                report={mapReportForCard(report)}
                showVoting
                onViewDetails={() => setSelectedReport(report)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Authority Contact Hub */}
      {authorityContactReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Authority Contact Hub ({authorityContactReports.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            These reports are ready for authority contact. Volunteers can reach
            out to relevant officials.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorityContactReports.map((report) => (
              <ReportCard
                key={report.id}
                report={mapReportForCard(report)}
                showAuthorityContact
                onViewDetails={() => setSelectedReport(report)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Reports */}
      {otherReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            All Reports ({otherReports.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherReports.map((report) => (
              <ReportCard
                key={report.id}
                report={mapReportForCard(report)}
                onViewDetails={() => setSelectedReport(report)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No reports found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Be the first to submit a community report!"}
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition"
              asChild
            >
              <Link href="/reports/new">
                <Plus className="h-4 w-4 mr-2" /> Submit First Report
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Overlay: FIXED */}
      {selectedReport && (
        <ReportDetailPage
          report={{
            ...selectedReport,
            reporter: selectedReport.reporter ?? {
              id: "unknown",
              email: "Unknown",
              role: "USER",
            },
          }}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
