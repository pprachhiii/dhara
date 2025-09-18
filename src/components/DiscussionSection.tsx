"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/stores";
import { DiscussionPhase } from "@prisma/client";
import { Discussion as DiscussionType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DiscussionSectionProps {
  phase: DiscussionPhase;
  reportId?: string;
  driveId?: string;
}

export const DiscussionSection: React.FC<DiscussionSectionProps> = ({
  phase,
  reportId,
  driveId,
}) => {
  const { currentUser } = useAppStore();
  const [discussions, setDiscussions] = useState<DiscussionType[]>([]);
  const [newContent, setNewContent] = useState("");

  const fetchDiscussions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ phase });
      if (reportId) params.append("reportId", reportId);
      if (driveId) params.append("driveId", driveId);

      const res = await fetch(`/api/discussion?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch discussions");

      const data: DiscussionType[] = await res.json();
      setDiscussions(data);
    } catch (err) {
      console.error(err);
    }
  }, [phase, reportId, driveId]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handlePost = async () => {
    if (!newContent.trim() || !currentUser) return;

    const tempDiscussion: DiscussionType = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      user: currentUser,
      content: newContent,
      createdAt: new Date(),
      phase,
      reportId,
      driveId,
    };

    setDiscussions((prev) => [...prev, tempDiscussion]);
    setNewContent("");

    try {
      const res = await fetch("/api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, content: newContent, reportId, driveId }),
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to post discussion");
        fetchDiscussions();
      } else {
        fetchDiscussions();
      }
    } catch (err) {
      console.error(err);
      fetchDiscussions();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Discussions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {currentUser && (
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
              placeholder="Add a comment..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <Button
              onClick={handlePost}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Post
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {discussions.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No discussions yet.
            </p>
          )}
          {discussions.map((d) => (
            <div
              key={d.id}
              className="p-3 rounded-xl bg-muted/40 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{d.user.name || d.user.email}</span> •{" "}
                {new Date(d.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 text-sm">{d.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
