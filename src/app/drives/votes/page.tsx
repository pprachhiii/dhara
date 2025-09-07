"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Discussion, Drive } from "@/lib/types"; 
import { format } from "date-fns";

type DriveWithExtras = Drive & {
  voteCount?: number;
};

export default function DrivesVotingPage() {
  const [drives, setDrives] = useState<DriveWithExtras[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchDrives();
    fetchDiscussions();
  }, []);

  async function fetchDrives() {
    try {
      const data: DriveWithExtras[] = await fetch("/api/drives").then(res => res.json());
      setDrives(data);
    } catch {
      toast.error("Failed to load drives");
    }
  }

  async function fetchDiscussions() {
    try {
      const data: Discussion[] = await fetch("/api/discussion?phase=DRIVE_VOTING").then(res => res.json());
      setDiscussions(data);
    } catch {
      toast.error("Failed to load discussions");
    }
  }

  async function handleVote(driveId: string) {
    try {
      const res = await fetch("/api/votes/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", driveId }),
      });

      if (res.ok) {
        toast.success("Vote submitted!");
        await fetchDrives();
      } else {
        const err = await res.json();
        toast.error(err.error || "Vote failed");
      }
    } catch {
      toast.error("Vote failed");
    }
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    try {
      const res = await fetch("/api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", phase: "DRIVE_VOTING", content: comment }),
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
      <h1 className="text-3xl font-bold mb-6 text-center">Community Drives Voting & Discussion</h1>

      <div className="flex gap-6">
        {/* Voting Section - Left */}
        <div className="w-1/2 space-y-4">
          <h2 className="text-2xl font-bold mb-2">Vote for Drives</h2>
          {drives.map(d => (
            <div
              key={d.id}
              className="flex justify-between items-center border rounded-xl p-4 bg-white shadow-sm hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-gray-500 text-sm">
                  Participants: {d.participant} | Start: {format(new Date(d.startDate), "PPP")}
                  {d.endDate && ` | End: ${format(new Date(d.endDate), "PPP")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleVote(d.id)}>👍 Vote</Button>
                <span>{d.voteCount ?? 0}</span>
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
