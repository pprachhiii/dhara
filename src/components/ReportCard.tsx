"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Phone, Users } from "lucide-react";
import { Report, ReportStatus, Task, ReportAuthority } from "@/lib/types";
import { useAppStore } from "@/lib/stores";

interface ReportCardProps {
  report: Report & {
    votes?: Report["votes"];
    tasks?: Task[];
    reportAuthorities?: ReportAuthority[];
  };
  showVoting?: boolean;
  showAuthorityContact?: boolean;
  onViewDetails?: () => void; 
}

export function ReportCard({
  report,
  showVoting = false,
  showAuthorityContact = false,
  onViewDetails,
}: ReportCardProps) {
  const { voteOnReport, contactAuthority } = useAppStore();

  const getStatusBadge = (status: ReportStatus) => {
    const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
      PENDING: { label: "Pending", className: "phase-pending" },
      ELIGIBLE_AUTHORITY: { label: "Eligible for Authority Contact", className: "phase-voting" },
      AUTHORITY_CONTACTED: { label: "Authority Contacted", className: "phase-progress" },
      ELIGIBLE_DRIVE: { label: "Eligible for Drive", className: "phase-voting" },
      VOTING_FINALIZED: { label: "Voting Finalized", className: "phase-progress" },
      IN_PROGRESS: { label: "In Progress", className: "phase-progress" },
      RESOLVED: { label: "Resolved", className: "phase-completed" },
    };
    return <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>;
  };

  const handleVote = () => voteOnReport(report.id);
  const handleContactAuthority = () => contactAuthority(report.id);

  const canContactAuthority =
    report.status === "ELIGIBLE_AUTHORITY" &&
    !report.reportAuthorities?.some((ra) => ra.status === "CONTACTED");

  // Choose image from imageUrl or first media item
  const reportImage = report.imageUrl || report.media?.[0] || null;

  // Build location string
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
          {showVoting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 transition"
            >
              <Heart className="h-4 w-4" />
              <span>{report.votes?.length ?? 0}</span>
            </Button>
          )}

          {showAuthorityContact && canContactAuthority && (
            <Button
              onClick={handleContactAuthority}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contact Authority
            </Button>
          )}

          {showAuthorityContact &&
            report.reportAuthorities?.some((ra) => ra.status === "CONTACTED") && (
              <div className="flex items-center space-x-2 text-sm text-green-800">
                <Phone className="h-4 w-4" />
                <span>Authority Contacted</span>
              </div>
            )}

          {!showVoting && !showAuthorityContact && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
