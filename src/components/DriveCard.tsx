"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle } from "lucide-react";
import { Drive, Task } from "@/lib/types";

interface DriveCardProps {
  drive: Drive & {
    tasks?: Task[];
    reports?: { id: string }[];
  };
  onViewDetails?: () => void;
}

export function DriveCard({ drive, onViewDetails }: DriveCardProps) {
  const getStatusBadge = (status: Drive["status"]) => {
    const statusConfig: Record<Drive["status"], { label: string; className: string }> = {
      PLANNED: { label: "Planned", className: "phase-progress" },
      VOTING_FINALIZED: { label: "Voting Finalized", className: "phase-voting" },
      ONGOING: { label: "Ongoing", className: "phase-progress" },
      COMPLETED: { label: "Completed", className: "phase-completed" },
    };
    return <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>;
  };

  const volunteerCount = new Set(
    (drive.tasks ?? []).map((task) => task.volunteerId).filter(Boolean)
  ).size;

  const completedTasks = (drive.tasks ?? []).filter((t) => t.status === "COMPLETED").length;
  const totalTasks = (drive.tasks ?? []).length;

  // Function to fetch the proper reportId from the backend
  const goToTasks = async () => {
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveId: drive.id }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to fetch tasks");
        return;
      }

      const data = await res.json();
      window.location.href = `/tasks?reportId=${data.reportId}`;
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    }
  };

  return (
    <Card
      className="overflow-hidden transition hover:shadow-lg rounded-2xl cursor-pointer"
      onClick={onViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
              {drive.title}
            </h3>
            {getStatusBadge(drive.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{drive.description}</p>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(drive.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{volunteerCount} volunteers signed up</span>
        </div>
        {(drive.status === "ONGOING" || drive.status === "COMPLETED") && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>
              {completedTasks}/{totalTasks} tasks completed
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/20 mt-4">
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>

          {drive.status === "PLANNED" && (
            <Link href="/drives/votes">
              <Button
                size="sm"
                className="forest-gradient text-white shadow-gentle hover:shadow-accent transition-smooth"
              >
                Vote
              </Button>
            </Link>
          )}
          {drive.status === "VOTING_FINALIZED" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="shadow-gentle hover:shadow-accent transition-smooth"
                onClick={goToTasks}
              >
                Tasks
              </Button>

              <Button
                size="sm"
                className="forest-gradient text-white shadow-gentle hover:shadow-accent transition-smooth"
                onClick={goToTasks}
              >
                Volunteer
              </Button>
            </div>
          )}

          {drive.status === "ONGOING" && (
            <div className="flex gap-2">
              {/* Tasks button now behaves like Volunteer */}
              <Button
                size="sm"
                variant="outline"
                className="shadow-gentle hover:shadow-accent transition-smooth"
                onClick={goToTasks}
              >
                Tasks
              </Button>

              <Button
                size="sm"
                className="forest-gradient text-white shadow-gentle hover:shadow-accent transition-smooth"
                onClick={goToTasks}
              >
                Volunteer
              </Button>
            </div>
          )}

          {drive.status === "COMPLETED" && (
            <Button size="sm" disabled variant="secondary">
              Completed
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
