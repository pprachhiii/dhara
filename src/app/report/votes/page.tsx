"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";
import { Report } from "@/lib/types";

export default function VotePage() {
  const [reports, setReports] = useState<(Report & { votes?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔑 Generate a persistent pseudo-userId
  useEffect(() => {
    let stored = localStorage.getItem("userId");
    if (!stored) {
      stored = crypto.randomUUID(); // unique per browser
      localStorage.setItem("userId", stored);
    }
    setUserId(stored);
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await fetch("/api/reports").then((res) => res.json());
      setReports(data);
    } catch {
      toast.error("Failed to load reports");
    }
  }

  async function handleVote(reportId: string) {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/votes/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reportId }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to vote");
        return;
      }

      toast.success("Vote submitted ✅");
      await loadReports();
    } catch {
      toast.error("Error submitting vote");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-y-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Community Voting</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="border rounded-2xl shadow-md p-4 flex flex-col"
          >
            <h2 className="text-xl font-semibold">{r.title}</h2>
            <p className="text-sm text-gray-500 mb-2">By {r.reporter}</p>
            <p className="text-sm flex-1">{r.description}</p>

            {r.imageUrl && (
              <div className="relative w-full h-40 my-3">
                <Image
                  src={r.imageUrl}
                  alt="report"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">
                Votes: {r.votes ?? 0}
              </span>
              <Button
                size="sm"
                onClick={() => handleVote(r.id)}
                disabled={loading}
              >
                Vote
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
