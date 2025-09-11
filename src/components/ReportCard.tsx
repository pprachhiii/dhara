"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";
import { Report, ReportStatus, Task, ReportAuthority } from "@/lib/types";

interface ReportCardProps {
  report: Report & {
    votes?: Report["votes"];
    tasks?: Task[];
    reportAuthorities?: ReportAuthority[];
    drives?: { id: string }[]; // drives linked to the report
  };
  showVoting?: boolean;
  showAuthorityContact?: boolean;
  onViewDetails?: () => void;
}

export function ReportCard({
  report,
  onViewDetails,
}: ReportCardProps) {
  const getStatusBadge = (status: ReportStatus) => {
    const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
      PENDING: { label: "Pending", className: "phase-pending" },
      AUTHORITY_CONTACTED: { label: "Authority Contacted", className: "phase-progress" },
      ELIGIBLE_DRIVE: { label: "Eligible for Drive", className: "phase-voting" },
      VOTING_FINALIZED: { label: "Voting Finalized", className: "phase-progress" },
      IN_PROGRESS: { label: "In Progress", className: "phase-progress" },
      RESOLVED: { label: "Resolved", className: "phase-completed" },
    };
    return <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>;
  };

  const reportImage = report.imageUrl || report.media?.[0] || null;

  const locationString = report.city
    ? `${report.city}${report.region ? `, ${report.region}` : ""}, ${report.country ?? ""}`
    : "Location TBD";

  return (
    <Card className="overflow-hidden transition hover:shadow-lg rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
              {report.title}
            </h3>
            {getStatusBadge(report.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {reportImage && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <Image src={reportImage} alt={report.title} fill className="object-cover" />
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">{report.description}</p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{locationString}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>

          {report.tasks && report.tasks.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{report.tasks.filter((t) => t.volunteerId).length} volunteers assigned</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/20">
        <div className="flex items-center justify-between w-full">
          {/* View Details Button */}
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>

          {/* Dynamic Status Button */}
          {(() => {
            const now = new Date();
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);

            const driveCount = report.drives?.length ?? 0;
            const votesCount = report.votes?.length ?? 0;

            switch (report.status) {
              // Phase 1: Report Submitted
              case "PENDING":
                return (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/authority")}
                  >
                    Contact Authority
                  </Button>
                );
              
              // Phase 2: Authority Contacted
              case "AUTHORITY_CONTACTED":
                if (new Date(report.updatedAt) <= sevenDaysAgo && votesCount > 10) {
                  // Eligible for Drive
                  if (driveCount === 0) {
                    return (
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white shadow-md transition"
                        onClick={() => (window.location.href = "/form?model=Drive")}
                      >
                        Create Drive
                      </Button>
                    );
                  } else if (driveCount > 1) {
                    return (
                      <Button
                        className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-md transition"
                        onClick={() => (window.location.href = "/drives/votes")}
                      >
                        Vote For Drive
                      </Button>
                    );
                  }
                }
                return (
                  <Button className="bg-gray-300 text-black cursor-default" disabled>
                    Authority Contacted
                  </Button>
                );

              // Drive Phase
              case "ELIGIBLE_DRIVE":
                if (driveCount === 1 || driveCount === 0 ) {
                  return (
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white shadow-md transition"
                      onClick={() => (window.location.href = "/form?model=Drive")}
                    >
                      Create Drive
                    </Button>
                  );
                } else if (driveCount > 1) {
                  return (
                    <Button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-md transition"
                      onClick={() => (window.location.href = "/drives/votes")}
                    >
                      Vote For Drive
                    </Button>
                  );
                }
                return null;

              // Voting Finalized
              case "VOTING_FINALIZED":
                return (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/volunteer")}
                  >
                    Volunteer
                  </Button>
                );

              // In Progress: show both Task + Volunteer
              case "IN_PROGRESS":
                return (
                  <div className="flex gap-2">
                    <Button
                      className="bg-teal-500 hover:bg-teal-600 text-white shadow-md transition"
                      onClick={() => (window.location.href = "/tasks")}
                    >
                      Task
                    </Button>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transition"
                      onClick={() => (window.location.href = "/volunteer")}
                    >
                      Volunteer
                    </Button>
                  </div>
                );

              // Resolved
              case "RESOLVED":
                return (
                  <Button className="bg-gray-300 text-black cursor-default" disabled>
                    Resolved
                  </Button>
                );

              default:
                return null;
            }
          })()}
        </div>
      </CardFooter>
    </Card>
  );
}
