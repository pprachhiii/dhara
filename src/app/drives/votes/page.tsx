"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Drive } from "@/lib/types";

export default function DriveVotePage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadDrives = async () => {
      try {
        const query = new URLSearchParams();
        if (searchQuery) query.append("search", searchQuery);

        const res = await fetch(`/api/drives?${query.toString()}`);
        const json = await res.json();

        // ✅ Ensure drives is always an array
        const data = Array.isArray(json) ? json : json?.drives || [];
        setDrives(data);
      } catch (err) {
        console.error("Failed to load drives", err);
        toast.error("Failed to load drives");
        setDrives([]); // fallback to empty
      }
    };

    loadDrives();
  }, [searchQuery]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Vote for Drives</h1>

      {/* Search */}
      <Input
        placeholder="Search drives..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 max-w-xs"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {drives.length === 0 ? (
          <p className="text-gray-500">No drives found</p>
        ) : (
          drives.map((d) => (
            <div
              key={d.id}
              className="border rounded-2xl shadow-md p-4 flex flex-col"
            >
              <h2 className="font-bold text-lg mb-2">{d.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{d.description}</p>
              <Button
                onClick={async () => {
                  const res = await fetch("/api/votes/drives", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: "USER_ID", driveId: d.id }),
                  });
                  if (res.ok) {
                    toast.success("Vote submitted!");
                  } else {
                    const err = await res.json();
                    toast.error(err.error || "Vote failed");
                  }
                }}
              >
                Vote
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
