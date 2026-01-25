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
import { ReportCard } from "@/components/reports/ReportCard";
import { useAppStore } from "@/lib/stores";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { ReportStatus, TaskStatus, EngagementLevel } from "@prisma/client";
import { ReportDetailPage } from "@/components/ReportDetailedPage";
import { Report } from "@/lib/types";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const { reports, setReports } = useAppStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Fetch reports
  useEffect(() => {
    const fetchReports = async (): Promise<void> => {
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

  const filteredReports: Report[] = reports
    .filter((report: Report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: Report, b: Report) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "votes":
          return (b.unifiedVotes?.length ?? 0) - (a.unifiedVotes?.length ?? 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Map reports for card
  const mapReportForCard = (report: Report): Report => ({
    ...report,
    unifiedVotes: report.unifiedVotes?.map((v) => ({
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
      engagement: t.engagement ?? EngagementLevel.INDIVIDUAL,
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

  // Section Renderer
  const renderSection = (
    title: string,
    description: string,
    reportsArray: Report[],
    sectionKey: string
  ) => {
    if (reportsArray.length === 0) return null;
    const isExpanded = expandedSections[sectionKey] ?? false;
    const visibleReports = isExpanded ? reportsArray : reportsArray.slice(0, 3);

    return (
      <div className="space-y-4" key={sectionKey}>
        <h2 className="text-2xl font-bold">
          {title} ({reportsArray.length})
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReports.map((report, index) => (
            <ReportCard
              key={`${sectionKey}-${report.id}-${index}`} // unique key
              report={mapReportForCard(report)}
              onViewDetails={() => setSelectedReport(report)}
            />
          ))}
        </div>
        {reportsArray.length > 3 && (
          <Button
            variant="outline"
            className="mt-2"
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                [sectionKey]: !isExpanded,
              }))
            }
          >
            {isExpanded ? "Collapse" : "View All"}
          </Button>
        )}
      </div>
    );
  };

  // Group reports by status
  const hubs = [
    {
      key: "pending",
      title: "Pending Hub",
      description: "Newly submitted reports awaiting review or initial action.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.PENDING),
    },
    {
      key: "authorityContacted",
      title: "Authority Contacted Hub",
      description: "Reports that have been forwarded to authorities and awaiting response.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.AUTHORITY_CONTACTED),
    },
    {
      key: "resolvedByAuthority",
      title: "Resolved by Authority",
      description: "Reports successfully resolved by relevant authorities.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.RESOLVED_BY_AUTHORITY),
    },
    {
      key: "eligibleForVote",
      title: "Community Voting Hub",
      description: "Reports open for community voting to decide next steps.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.ELIGIBLE_FOR_VOTE),
    },
    {
      key: "votingFinalized",
      title: "Voting Finalized Hub",
      description: "Reports where voting is complete and actions are being planned.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.VOTING_FINALIZED),
    },
    {
      key: "eligibleForDrive",
      title: "Eligible for Drive Hub",
      description: "Reports identified as eligible for environmental drives and campaigns.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.ELIGIBLE_FOR_DRIVE),
    },
    {
      key: "driveFinalized",
      title: "Drive Finalized Hub",
      description: "Reports where community drives have been successfully completed.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.DRIVE_FINALIZED),
    },
    {
      key: "inProgress",
      title: "In Progress Hub",
      description: "Reports actively being worked on by community or authorities.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.IN_PROGRESS),
    },
    {
      key: "underMonitoring",
      title: "Under Monitoring Hub",
      description: "Reports under ongoing observation to ensure long-term resolution.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.UNDER_MONITORING),
    },
    {
      key: "resolved",
      title: "🏆 Resolved Hub",
      description: "Reports that have been completely resolved and closed.",
      reports: filteredReports.filter((r) => r.status === ReportStatus.RESOLVED),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Reports</h1>
          <p className="text-muted-foreground">
            Organized hubs based on report lifecycle stages for clear tracking and action.
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md"
          asChild
        >
          <Link href="/reports/new">
            <Plus className="h-4 w-4 mr-2" /> Report Issue
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, description, or status..."
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

      {/* Status Hubs */}
      {hubs.map((hub) => renderSection(hub.title, hub.description, hub.reports, hub.key))}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Be the first to submit a report!"}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl" asChild>
              <Link href="/reports/new">
                <Plus className="h-4 w-4 mr-2" /> Submit First Report
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Report Detail Overlay */}
      {selectedReport && (
        <ReportDetailPage
          report={{
            ...selectedReport,
            reporter: selectedReport.reporter ?? { id: "unknown", email: "Unknown", role: "USER" },
          }}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
