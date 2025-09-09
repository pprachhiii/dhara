"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Report, Discussion } from "@/lib/types";

type ReportWithExtras = Report & {
  voteCount?: number;
};

export default function ReportsVotingPage() {
  const [reports, setReports] = useState<ReportWithExtras[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comment, setComment] = useState("");

  // Fetch reports and discussions
  useEffect(() => {
    fetchReports();
    fetchDiscussions();
  }, []);

  async function fetchReports() {
    try {
      const data: ReportWithExtras[] = await fetch("/api/reports").then(res => res.json());
      setReports(data);
    } catch {
      toast.error("Failed to load reports");
    }
  }

  async function fetchDiscussions() {
    try {
      const data: Discussion[] = await fetch("/api/discussion?phase=REPORT_VOTING").then(res => res.json());
      setDiscussions(data);
    } catch {
      toast.error("Failed to load discussions");
    }
  }

  // Vote handler
  async function handleVote(reportId: string) {
    try {
      const res = await fetch("/api/votes/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", reportId }),
      });

      if (res.ok) {
        toast.success("Vote submitted!");
        await fetchReports();
      } else {
        const err = await res.json();
        toast.error(err.error || "Vote failed");
      }
    } catch {
      toast.error("Vote failed");
    }
  }

  // Add discussion comment
  async function handleAddComment() {
    if (!comment.trim()) return;
    try {
      const res = await fetch("/api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", phase: "REPORT_VOTING", content: comment }),
      });

      if (res.ok) {
        setComment("");
        await fetchDiscussions();
      } else {
        toast.error("Failed to add comment");
      }
    } catch {
      toast.error("Failed to add comment");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Community Reports Voting & Discussion</h1>

      <div className="flex gap-6">
        {/* Voting Section - Left */}
        <div className="w-1/2 space-y-4">
          <h2 className="text-2xl font-bold mb-2">Vote for Reports</h2>
          {reports.map(report => (
            <div
              key={report.id}
              className="flex justify-between items-center border rounded-xl p-4 bg-white shadow-sm hover:bg-gray-50 transition"
            >
              <span className="font-medium">{report.title}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleVote(report.id)}>👍 Vote</Button>
                <span>{report.voteCount ?? 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Discussion Section - Right */}
        <div className="w-1/2 flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Community Discussion</h2>
          <div className="flex-1 space-y-2 overflow-y-auto border rounded p-3 mb-3 max-h-[600px]">
            {discussions.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              discussions.map(d => (
                <div key={d.id} className="border-b pb-1 text-sm">
                  <span className="font-medium">{d.userId}</span>: {d.content}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 mt-auto">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <Button onClick={handleAddComment}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
