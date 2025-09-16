"use client";

import { useAppStore } from "@/lib/stores";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { DriveDetailPage } from "@/components/DriveDetailedPage";
import type { Drive } from "@/lib/types";

const VotingDrives = () => {
  const { drives, voteOnDrive, fetchDrives } = useAppStore();
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const allDrives = (drives ?? []) as Drive[];

  const votesCount = (drive: Drive) =>
    drive.unifiedVotes?.length ?? drive.finalVoteCount ?? 0;

  const topDrives = [...allDrives]
    .sort((a, b) => votesCount(b) - votesCount(a))
    .slice(0, 3);

  const handleVote = (driveId: string) => {
    voteOnDrive(driveId);
  };

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

      {/* Each Drive as full-width horizontal card */}
      <div className="space-y-4">
        {allDrives.map((drive) => (
          <Card
            key={drive.id}
            onClick={() => setSelectedDrive(drive)}
            className="cursor-pointer hover:shadow-lg transition"
          >
            <CardHeader className="flex flex-row justify-between items-center bg-muted px-4 py-3">
              <CardTitle className="text-lg font-semibold">
                {drive.title}
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-red-500 font-semibold">
                  <Heart className="h-5 w-5 fill-current" />
                  {votesCount(drive)}
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(drive.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-500 hover:text-white"
                >
                  <Heart className="h-4 w-4 mr-1 text-red-500 fill-current" />
                  Vote
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Top 3 Stage Layout */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          🏆 Top 3 Drives
        </h2>

        <div className="flex justify-center items-end text-center w-full gap-4">
          {/* Silver */}
          {topDrives[1] && (
            <div className="flex-1">
              <div
                className="bg-gray-200 h-48 flex flex-col justify-center items-center border cursor-pointer hover:shadow-md"
                onClick={() => setSelectedDrive(topDrives[1])}
              >
                <h3 className="font-semibold">{topDrives[1].title}</h3>
                <div className="flex items-center justify-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {votesCount(topDrives[1])}
                </div>
              </div>
            </div>
          )}

          {/* Gold */}
          {topDrives[0] && (
            <div className="flex-1">
              <div
                className="bg-yellow-200 h-64 flex flex-col justify-center items-center border cursor-pointer hover:shadow-md"
                onClick={() => setSelectedDrive(topDrives[0])}
              >
                <h3 className="font-semibold">{topDrives[0].title}</h3>
                <div className="flex items-center justify-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {votesCount(topDrives[0])}
                </div>
              </div>
            </div>
          )}

          {/* Bronze */}
          {topDrives[2] && (
            <div className="flex-1">
              <div
                className="bg-orange-200 h-40 flex flex-col justify-center items-center border cursor-pointer hover:shadow-md"
                onClick={() => setSelectedDrive(topDrives[2])}
              >
                <h3 className="font-semibold">{topDrives[2].title}</h3>
                <div className="flex items-center justify-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {votesCount(topDrives[2])}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay - Drive Details */}
      {selectedDrive && (
        <DriveDetailPage
          drive={selectedDrive}
          onClose={() => setSelectedDrive(null)}
        />
      )}
    </div>
  );
};

export default VotingDrives;
