"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Report } from "@/lib/types";
import Image from "next/image";

const VotingReports = () => {
  const { reports, voteOnReport } = useAppStore();
  // not used yet, so prefix with _ to satisfy eslint
  const [_selectedReport, _setSelectedReport] = useState<Report | null>(null);

  // Reports eligible for voting
  const votingEligibleReports = reports.filter(
    (report: Report) =>
      report.status === "PENDING" || report.status === "ELIGIBLE_DRIVE"
  );

  // Top 3 by vote count (safe with ?? 0)
  const topReports = [...votingEligibleReports]
    .sort((a, b) => (b.votes?.length ?? 0) - (a.votes?.length ?? 0))
    .slice(0, 3);

  const handleVote = (reportId: string) => {
    voteOnReport(reportId);
  };

  const ReportDetails = ({ report }: { report: Report }) => (
    <div className="space-y-4">
      {report.media && report.media.length > 0 && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={report.media[0]}
            alt={report.title}
            className="w-full h-full object-cover"
            width={800}
            height={450}
          />
        </div>
      )}
      <div className="space-y-2">
        {(report.city || report.region || report.country) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {[report.city, report.region, report.country]
              .filter(Boolean)
              .join(", ")}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(report.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          Reporter: {report.reporter?.name || report.reporter?.email}
        </div>
      </div>
      <p className="text-sm leading-relaxed">{report.description}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Vote on Reports
        </h1>
        <p className="text-muted-foreground">
          Help prioritize community issues by voting on reports
        </p>
      </div>

      {/* List of reports */}
      <div className="space-y-6">
        {votingEligibleReports.map((report: Report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {report.title}
                  </CardTitle>
                  {(report.city || report.region) && (
                    <CardDescription className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      {[report.city, report.region]
                        .filter(Boolean)
                        .join(", ")}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Heart className="h-4 w-4 fill-current" />
                    {report.votes?.length ?? 0}
                  </div>
                  <Button
                    onClick={() => handleVote(report.id)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Vote
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {report.media && report.media.length > 0 && (
                  <div className="w-24 h-24 overflow-hidden rounded-lg flex-shrink-0">
                    <Image
                      src={report.media[0]}
                      alt={report.title}
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {report.description}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{report.title}</DialogTitle>
                      </DialogHeader>
                      <ReportDetails report={report} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 3 Reports */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Top 3 Most Voted Reports
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {topReports.map((report: Report, index: number) => (
            <Card key={report.id} className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2">
                  {report.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-primary font-semibold">
                  <Heart className="h-4 w-4 fill-current" />
                  {report.votes?.length ?? 0} votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.media && report.media.length > 0 && (
                  <div className="w-full h-32 overflow-hidden rounded-lg mb-3">
                    <Image
                      src={report.media[0]}
                      alt={report.title}
                      className="w-full h-full object-cover"
                      width={320}
                      height={128}
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {report.description}
                </p>
                {report.city && (
                  <Badge variant="secondary" className="text-xs">
                    {report.city}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotingReports;
