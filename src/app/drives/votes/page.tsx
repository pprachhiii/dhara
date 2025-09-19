"use client";

import { useAppStore } from "@/lib/stores";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DiscussionSection } from "@/components/DiscussionSection";
import { DriveWithVotes, Vote } from "@/lib/types";

const VotingDrives = () => {
  const {
    drives,
    fetchDrives,
    currentUser,
    userLoading,
    fetchCurrentUser,
  } = useAppStore();

  const [selectedDrive, setSelectedDrive] = useState<DriveWithVotes | null>(
    null
  );
  const [showDiscussion, setShowDiscussion] = useState(false);

  useEffect(() => {
    fetchDrives();
    fetchCurrentUser();
  }, [fetchDrives, fetchCurrentUser]);

  // Normalize unifiedVotes into local drives
  const allDrives: DriveWithVotes[] = useMemo(
    () =>
      drives.map((d) => ({
        ...d,
        unifiedVotes: d.unifiedVotes ?? [],
      })),
    [drives]
  );

  const topDrives = allDrives
    .filter((d) => d.unifiedVotes.length > 0)
    .sort((a, b) => b.unifiedVotes.length - a.unifiedVotes.length)
    .slice(0, 3);

  const handleVote = async (driveId: string) => {
    if (!currentUser) return;

    const targetDrive = allDrives.find((d) => d.id === driveId);
    if (!targetDrive) return;

    const optimisticVote: Vote = {
      id: crypto.randomUUID(),
      driveId,
      userId: currentUser.id,
      user: currentUser,
      reportId: null,
      createdAt: new Date(),
    };

    const prevDrives = [...allDrives];

    useAppStore.setState({
      drives: drives.map((d) =>
        d.id === driveId
          ? { ...d, unifiedVotes: [...(d.unifiedVotes ?? []), optimisticVote] }
          : d
      ),
    });

    try {
      const res = await fetch("/api/votes/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveId }),
        credentials: "include",
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error("Vote failed:", error);
        useAppStore.setState({ drives: prevDrives });
        return;
      }

      await fetchDrives();
    } catch (err) {
      console.error("Error voting on drive:", err);
      useAppStore.setState({ drives: prevDrives });
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 flex gap-6">
      {/* 🔹 Main Content */}
      <div className="flex-1">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Vote on Drives
          </h1>
          <p className="text-lg text-muted-foreground">
            Support impactful drives by casting your vote and joining
            discussions.
          </p>
        </header>

        {/* Drive List */}
        <div className="grid gap-6">
          {allDrives.map((drive) => (
            <Card
              key={drive.id}
              className="hover:shadow-xl transition border rounded-xl"
            >
              <CardHeader className="flex flex-row justify-between items-center px-6 py-4 bg-muted/30 rounded-t-xl">
                <CardTitle className="text-lg font-semibold">
                  {drive.title}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-red-500 font-semibold">
                    <Heart className="h-5 w-5 fill-current" />
                    {drive.unifiedVotes.length}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(drive.id);
                    }}
                    variant="default"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={userLoading || !currentUser}
                  >
                    {userLoading ? (
                      "Loading..."
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-1 fill-current" />
                        Vote
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDrive(drive);
                      setShowDiscussion(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Discussion
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-4 text-sm text-muted-foreground">
                {drive.description || "No description provided."}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top 3 Drives */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            🏆 Top 3 Drives
          </h2>

          <div className="flex justify-center items-end text-center gap-6">
            {topDrives.map((drive, idx) => (
              <div
                key={drive.id}
                className={`flex-1 ${
                  idx === 0
                    ? "bg-gradient-to-t from-yellow-300 to-yellow-100 h-64 shadow-lg"
                    : idx === 1
                    ? "bg-gradient-to-t from-gray-200 to-gray-100 h-48"
                    : "bg-gradient-to-t from-orange-300 to-orange-100 h-40"
                } flex flex-col justify-center items-center rounded-lg shadow cursor-pointer hover:shadow-xl transition`}
                onClick={() => {
                  setSelectedDrive(drive);
                  setShowDiscussion(false);
                }}
              >
                <h3 className="font-semibold">{drive.title}</h3>
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {drive.unifiedVotes.length}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 🔹 Discussion Panel */}
      {showDiscussion && selectedDrive && (
        <div className="w-1/4 pl-4 border-l bg-muted/40 rounded-lg shadow-inner relative">
          <button
            onClick={() => setShowDiscussion(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <DiscussionSection phase="DRIVE_VOTING" driveId={selectedDrive.id} />
        </div>
      )}
    </div>
  );
};

export default VotingDrives;
