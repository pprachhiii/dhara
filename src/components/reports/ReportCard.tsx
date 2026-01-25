"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";
import { Report, ReportStatus, Task, ReportAuthority } from "@/lib/types";

interface ReportCardProps {
  report: Report & {
    votes?: Report["unifiedVotes"];
    tasks?: Task[];
    reportAuthorities?: ReportAuthority[];
    drives?: { id: string }[];
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
      RESOLVED_BY_AUTHORITY: { label: "Resolved by Authority", className: "phase-progress" },
      ELIGIBLE_FOR_VOTE: { label: "Eligible for Vote", className: "phase-voting" },
      VOTING_FINALIZED: { label: "Voting Finalized", className: "phase-progress" },
      ELIGIBLE_FOR_DRIVE: { label: "Eligible for Drive", className: "phase-voting" },
      DRIVE_FINALIZED: { label: "Drive Finalized", className: "phase-progress" },
      IN_PROGRESS: { label: "In Progress", className: "phase-progress" },
      UNDER_MONITORING: { label: "Under Monitoring", className: "phase-progress" },
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
              <span>{report.tasks.filter((t) => t.id).length} s assigned</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/20">
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>

          {(() => {
            switch (report.status) {
              case "PENDING":
                return (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/authority")}
                  >
                    Contact Authority
                  </Button>
                );

              case "AUTHORITY_CONTACTED":
                return (
                  <Button className="bg-gray-300 text-black cursor-default" disabled>
                    Authority Contacted
                  </Button>
                );

              case "RESOLVED_BY_AUTHORITY":
                return (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/enhancement")}
                  >
                    Resolved by Authority
                  </Button>
                );

              case "ELIGIBLE_FOR_VOTE":
                return (
                  <Button
                    className="bg-purple-500 hover:bg-purple-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/reports/votes")}
                  >
                    Vote
                  </Button>
                );

              case "ELIGIBLE_FOR_DRIVE":
                return (
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/drives/new")}
                  >
                    Create Drive
                  </Button>
                );
                
                case "VOTING_FINALIZED":
                return (
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white shadow-md transition"
                    onClick={() => (window.location.href = "/drives/new")}
                  >
                    Create Drive
                  </Button>
                );
              case "DRIVE_FINALIZED":
                return (
                <Button
                  className="bg-purple-500 hover:bg-purple-600 text-white shadow-md transition"
                  onClick={() => (window.location.href = "/drives/votes")}
                >
                  Vote
                </Button>
              );
              case "IN_PROGRESS":
                return (
                  <div className="flex gap-2">
                    <Button
                      className="bg-teal-500 hover:bg-teal-600 text-white shadow-md transition"
                      onClick={() => (window.location.href = `/tasks?reportId=${report.id}`)}
                    >
                      Task
                    </Button>

                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white shadow-md transition"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/volunteer", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ reportId: report.id, driveId: report.drives?.[0]?.id }),
                          });

                          if (!res.ok) {
                            const err = await res.json();
                            alert(err.error || "Failed to volunteer");
                            return;
                          }

                          const data = await res.json();
                          window.location.href = `/tasks?reportId=${data.reportId}`;
                        } catch (e) {
                          console.error(e);
                          alert("Something went wrong");
                        }
                      }}
                    >
                      Volunteer
                    </Button>


                  </div>
                );

              case "UNDER_MONITORING":
                return (
                  <Button className="bg-gray-300 text-black cursor-default" disabled>
                    Under Monitoring
                  </Button>
                );

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
