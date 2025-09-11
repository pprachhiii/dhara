"use client";

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
import { Heart, Calendar, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drive } from "@/lib/types";

const VotingDrives = () => {
  const { drives, voteOnDrive } = useAppStore();

  // Drives eligible for voting (schema uses enums)
  const votingEligibleDrives = drives.filter(
    (drive: Drive) => drive.status === "PLANNED"
  );

  // Top 3 by vote count
  const topDrives = [...votingEligibleDrives]
    .sort((a, b) => (b.votes?.length ?? 0) - (a.votes?.length ?? 0))
    .slice(0, 3);

  const handleVote = (driveId: string) => {
    voteOnDrive(driveId);
  };

  const DriveDetails = ({ drive }: { drive: Drive }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(drive.startDate).toLocaleDateString()}{" "}
          {drive.endDate
            ? `– ${new Date(drive.endDate).toLocaleDateString()}`
            : ""}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          Participants: {drive.participant}
        </div>
      </div>
      <p className="text-sm leading-relaxed">{drive.description}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Vote on Drives
        </h1>
        <p className="text-muted-foreground">
          Support important community drives by voting on them
        </p>
      </div>

      {/* List of drives */}
      <div className="space-y-6">
        {votingEligibleDrives.map((drive: Drive) => (
          <Card key={drive.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {drive.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(drive.startDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Heart className="h-4 w-4 fill-current" />
                    {drive.votes?.length ?? 0}
                  </div>
                  <Button
                    onClick={() => handleVote(drive.id)}
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
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {drive.description}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{drive.title}</DialogTitle>
                    </DialogHeader>
                    <DriveDetails drive={drive} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 3 Drives */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Top 3 Most Voted Drives
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {topDrives.map((drive: Drive, index: number) => (
            <Card key={drive.id} className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2">
                  {drive.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-primary font-semibold">
                  <Heart className="h-4 w-4 fill-current" />
                  {drive.votes?.length ?? 0} votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {drive.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Starts: {new Date(drive.startDate).toLocaleDateString()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotingDrives;
