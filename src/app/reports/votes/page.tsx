"use client";

import { useAppStore } from "@/lib/stores";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ReportWithVotes, Vote } from "@/lib/types";
import { DiscussionSection } from "@/components/DiscussionSection";

const VotingReports = () => {
  const { reports, fetchReports, currentUser, userLoading, fetchCurrentUser } =
    useAppStore();
  const [selectedReport, setSelectedReport] =
    useState<ReportWithVotes | null>(null);
  const [showDiscussion, setShowDiscussion] = useState(false);

  useEffect(() => {
    fetchReports("ELIGIBLE_FOR_VOTE");
    fetchCurrentUser();
  }, [fetchReports, fetchCurrentUser]);


  const allReports = useMemo<ReportWithVotes[]>(
    () =>
      reports.map((r) => ({
        ...r,
        votes: r.unifiedVotes ?? [],
      })),
    [reports]
  );

  const topReports = allReports
    .filter((r) => r.votes.length > 0)
    .sort((a, b) => b.votes.length - a.votes.length)
    .slice(0, 3);

  const handleVote = async (reportId: string) => {
    if (!currentUser) return;

    const targetReport = allReports.find((r) => r.id === reportId);
    if (!targetReport) return;

    const optimisticVote: Vote = {
      id: crypto.randomUUID(),
      reportId,
      userId: currentUser.id,
      user: currentUser,
      createdAt: new Date(),
    };

    const prevReports = [...allReports];

    useAppStore.setState({
      reports: reports.map((r) =>
        r.id === reportId
          ? { ...r, unifiedVotes: [...(r.unifiedVotes ?? []), optimisticVote] }
          : r
      ),
    });

    try {
      const res = await fetch("/api/votes/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
        credentials: "include",
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error("Vote failed:", error);
        useAppStore.setState({ reports: prevReports });
        return;
      }

      await fetchReports();
    } catch (err) {
      console.error("Error voting on report:", err);
      useAppStore.setState({ reports: prevReports });
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 flex gap-6">
      {/* 🔹 Main Content */}
      <div className="flex-1">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Vote on Reports
          </h1>
          <p className="text-lg text-muted-foreground">
            Support important community reports by casting your vote and joining
            discussions.
          </p>
        </header>

        {/* Report List */}
        <div className="grid gap-6">
          {allReports.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-xl transition border rounded-xl"
            >
              <CardHeader className="flex flex-row justify-between items-center px-6 py-4 bg-muted/30 rounded-t-xl">
                <CardTitle className="text-lg font-semibold">
                  {report.title}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-red-500 font-semibold">
                    <Heart className="h-5 w-5 fill-current" />
                    {report.votes.length}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(report.id);
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
                      setSelectedReport(report);
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
                {report.description || "No description provided."}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top 3 Stage */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            🏆 Top 3 Reports
          </h2>

          <div className="flex justify-center items-end text-center gap-6">
            {/* Silver */}
            {topReports[1] && (
              <div
                className="flex-1 bg-gradient-to-t from-gray-200 to-gray-100 h-48 flex flex-col justify-center items-center rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedReport(topReports[1]);
                  setShowDiscussion(false);
                }}
              >
                <h3 className="font-semibold">{topReports[1].title}</h3>
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {topReports[1].votes.length}
                </div>
              </div>
            )}

            {/* Gold */}
            {topReports[0] && (
              <div
                className="flex-1 bg-gradient-to-t from-yellow-300 to-yellow-100 h-64 flex flex-col justify-center items-center rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition"
                onClick={() => {
                  setSelectedReport(topReports[0]);
                  setShowDiscussion(false);
                }}
              >
                <h3 className="font-semibold">{topReports[0].title}</h3>
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {topReports[0].votes.length}
                </div>
              </div>
            )}

            {/* Bronze */}
            {topReports[2] && (
              <div
                className="flex-1 bg-gradient-to-t from-orange-300 to-orange-100 h-40 flex flex-col justify-center items-center rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedReport(topReports[2]);
                  setShowDiscussion(false);
                }}
              >
                <h3 className="font-semibold">{topReports[2].title}</h3>
                <div className="flex items-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {topReports[2].votes.length}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 🔹 Discussion Panel (Now on the RIGHT) */}
      {showDiscussion && selectedReport && (
        <div className="w-1/4 pl-4 border-l bg-muted/40 rounded-lg shadow-inner relative">
          {/* Close Button */}
          <button
            onClick={() => setShowDiscussion(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <DiscussionSection
            phase="REPORT_VOTING"
            reportId={selectedReport.id}
          />
        </div>
      )}
    </div>
  );
};

export default VotingReports;
