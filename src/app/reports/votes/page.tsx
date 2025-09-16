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
import { ReportWithVotes, Vote } from "@/lib/types";

const VotingReports = () => {
  const { reports, fetchReports, currentUser } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<ReportWithVotes | null>(null);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Cast reports into frontend shape
  const allReports: ReportWithVotes[] = reports.map((r) => ({
    ...r,
    votes: r.unifiedVotes ?? [],
  }));

  // Top 3 by votes
  const topReports = [...allReports]
    .sort((a, b) => b.votes.length - a.votes.length)
    .slice(0, 3);

  const handleVote = async (reportId: string) => {
    if (!currentUser) {
      console.error("User must be logged in to vote");
      return;
    }

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
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error("Vote failed:", error);

        // ❌ Rollback optimistic update
        useAppStore.setState({ reports: prevReports });
        return;
      }

      // ✅ Replace optimistic with real DB state
      await fetchReports();
    } catch (err) {
      console.error("Error voting on report:", err);
      useAppStore.setState({ reports: prevReports }); // rollback
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Vote on Reports
        </h1>
        <p className="text-muted-foreground">
          Support important community reports by voting on them
        </p>
      </div>

      {/* Each Report as full-width horizontal card */}
      <div className="space-y-4">
        {allReports.map((report) => (
          <Card
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="cursor-pointer hover:shadow-lg transition"
          >
            <CardHeader className="flex flex-row justify-between items-center bg-muted px-4 py-3">
              <CardTitle className="text-lg font-semibold">
                {report.title}
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-red-500 font-semibold">
                  <Heart className="h-5 w-5 fill-current" />
                  {report.votes.length}
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(report.id);
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
          🏆 Top 3 Reports
        </h2>

        <div className="flex justify-center items-end text-center w-full">
          {/* Silver */}
          {topReports[1] && (
            <div className="flex-1">
              <div
                className="bg-gray-200 h-48 flex flex-col justify-center items-center border cursor-pointer hover:shadow-md"
                onClick={() => setSelectedReport(topReports[1])}
              >
                <h3 className="font-semibold">{topReports[1].title}</h3>
                <div className="flex items-center justify-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {topReports[1].votes.length}
                </div>
              </div>
            </div>
          )}

          {/* Gold */}
          {topReports[0] && (
            <div className="flex-1">
              <div
                className="bg-yellow-200 h-64 flex flex-col justify-center items-center border cursor-pointer hover:shadow-md"
                onClick={() => setSelectedReport(topReports[0])}
              >
                <h3 className="font-semibold">{topReports[0].title}</h3>
                <div className="flex items-center justify-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {topReports[0].votes.length}
                </div>
              </div>
            </div>
          )}

          {/* Bronze */}
          {topReports[2] && (
            <div className="flex-1">
              <div
                className="bg-orange-200 h-40 flex flex-col justify-center items-center border cursor-pointer hover:shadow-md"
                onClick={() => setSelectedReport(topReports[2])}
              >
                <h3 className="font-semibold">{topReports[2].title}</h3>
                <div className="flex items-center justify-center gap-1 text-red-500 font-medium">
                  <Heart className="h-5 w-5 fill-current" />
                  {topReports[2].votes.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay - Report Details */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedReport(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedReport.title}</h2>
            <p className="text-muted-foreground mb-4">
              {selectedReport.description}
            </p>
            <div className="flex items-center gap-2 text-red-500">
              <Heart className="h-5 w-5 fill-current" />
              {selectedReport.votes.length} votes
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingReports;
