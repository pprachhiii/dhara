"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/ReportCard";
import { DriveCard } from "@/components/DriveCard";
import { ReportDetailPage } from "@/components/ReportDetailedPage";
import heroImage from '@/../public/hero-community.png';
import { FileText, Users, Award, TrendingUp, Plus } from "lucide-react";

import { Report, Drive, Volunteer } from "@/lib/types";

interface HomePageClientProps {
  initialReports: Report[];
  initialDrives: Drive[];
  initialVolunteers: Volunteer[];
}

export default function HomePageClient({ initialReports, initialDrives, initialVolunteers }: HomePageClientProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reports = initialReports;
  const drives = initialDrives;
  const volunteers = initialVolunteers;

  const activeReportsCount = reports.filter((r) => r.status !== "RESOLVED").length;
  const completedReportsCount = reports.filter((r) => r.status === "RESOLVED").length;
  const activeDrivesCount = drives.filter((d) => d.status !== "COMPLETED").length;
  const volunteerCount = volunteers.length;

  const recentReports = reports
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const upcomingDrives = drives
    .filter((d) => d.status === "PLANNED" || d.status === "VOTING_FINALIZED")
    .slice()
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 3);

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden shadow-elevated">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-blue-600" />
          <div className="absolute inset-0">
            <Image
              src={heroImage} 
              alt="Community environmental stewardship" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-gradient opacity-85" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
        </div>

        <div className="relative z-10 p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome!</h1>
            <p className="text-xl opacity-90 mb-6">
              Together, we&#39;re building a cleaner, greener India. Every action counts in our journey toward environmental stewardship.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-smooth shadow-gentle"
                asChild
              >
                <Link href="/reports/new">
                  <span className="inline-flex items-center">
                    <Plus className="h-5 w-5 mr-2" /> Submit Report
                  </span>
                </Link>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-smooth shadow-gentle"
                asChild
              >
                <Link href="/drives">
                  <span className="inline-flex items-center">
                    <Users className="h-5 w-5 mr-2" /> Browse Drives
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-gentle hover:shadow-elevated transition-smooth">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Active Reports</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{activeReportsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting community action</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-gentle hover:shadow-elevated transition-smooth">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Active Drives</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{activeDrivesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Community drives in progress</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-gentle hover:shadow-elevated transition-smooth">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Completed</span>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{completedReportsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Issues resolved</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-gentle hover:shadow-elevated transition-smooth">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Volunteers</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{volunteerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active community members</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recent Reports</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/reports">View All</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  showVoting={report.status === "VOTING_FINALIZED"}
                  showAuthorityContact={report.status === "AUTHORITY_CONTACTED"}
                  onViewDetails={() => setSelectedReport(report)}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reports yet. Be the first to submit one!</p>
                <Button className="mt-4" asChild>
                  <Link href="/reports/new">Submit First Report</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Drives</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/drives">View All</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingDrives.length > 0 ? (
              upcomingDrives.map((drive) => (
                <DriveCard
                  key={drive.id}
                  drive={drive}
                  showVoting={drive.status === "VOTING_FINALIZED"}
                  showSignup={drive.status === "PLANNED"}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming drives. Propose one based on community reports!</p>
                <Button className="mt-4" asChild>
                  <Link href="/drives/new">Propose Drive</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {selectedReport && (
        <ReportDetailPage
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </main>
  );
}
