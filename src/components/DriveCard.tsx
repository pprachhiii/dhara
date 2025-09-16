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

  // volunteer count from tasks
  const volunteerIds = (drive.tasks ?? []).map((task) => task.volunteerId).filter(Boolean);
  const uniqueVolunteers = new Set(volunteerIds);
  const volunteerCount = uniqueVolunteers.size;

  // tasks progress
  const completedTasks = (drive.tasks ?? []).filter((t) => t.status === "COMPLETED").length;
  const totalTasks = (drive.tasks ?? []).length;

  return (
    <Card className="overflow-hidden transition hover:shadow-lg rounded-2xl">
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
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">{drive.description}</p>

        {/* Meta information */}
        <div className="space-y-2">
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
        </div>

        {/* Task preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-card-foreground">Tasks:</h4>
          <div className="space-y-1">
            {(drive.tasks ?? []).slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center space-x-2 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.status === "COMPLETED" ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
                <span
                  className={
                    task.status === "COMPLETED"
                      ? "line-through text-muted-foreground"
                      : ""
                  }
                >
                  {task.report?.title ?? "Untitled Task"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {task.engagement}
                </Badge>
              </div>
            ))}
            {(drive.tasks?.length ?? 0) > 3 && (
              <div className="text-xs text-muted-foreground">
                +{drive.tasks!.length - 3} more tasks
              </div>
            )}
          </div>
        </div>

        {/* Linked reports */}
        {(drive.reports?.length ?? 0) > 0 && (
          <div className="text-xs text-muted-foreground">
            Addresses {drive.reports!.length} community report
            {drive.reports!.length > 1 ? "s" : ""}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/20">
        <div className="flex items-center justify-between w-full">
          {/* Always show View Details */}
          {onViewDetails ? (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              View Details
            </Button>
          ) : (
            <Link href={`/drives/${drive.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          )}

          {/* Status-based buttons */}
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

          {drive.status === "ONGOING" && (
            <div className="flex gap-2">
              <Link href="/tasks">
                <Button
                  size="sm"
                  variant="outline"
                  className="shadow-gentle hover:shadow-accent transition-smooth"
                >
                  Tasks
                </Button>
              </Link>
              <Link href="/form?model=Volunteer">
                <Button
                  size="sm"
                  className="forest-gradient text-white shadow-gentle hover:shadow-accent transition-smooth"
                >
                  Volunteer
                </Button>
              </Link>
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
