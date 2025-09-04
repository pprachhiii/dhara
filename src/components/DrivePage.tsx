"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Drive = {
  id: string;
  title: string;
  description?: string;
  participant: number;
  createdAt: string;
  reportId?: string | null;
  options: DriveOption[];
};

type DriveOption = {
  id: string;
  location: string;
  date?: string | null;
  votes: { id: string; voter: string; createdAt: string }[];
};

export default function DrivePage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [optionRows, setOptionRows] = useState<{ location: string; date?: string }[]>([
    { location: "", date: "" },
  ]);

  // simple voter identity (replace with auth user id in real app)
  const [voter, setVoter] = useState("");

  useEffect(() => {
    loadDrives();
  }, []);

  async function loadDrives() {
    setLoading(true);
    try {
      const res = await fetch("/api/drives");
      const data: Drive[] = await res.json();
      setDrives(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load drives");
    } finally {
      setLoading(false);
    }
  }

  function addOptionRow() {
    setOptionRows((s) => [...s, { location: "", date: "" }]);
  }
  function removeOptionRow(idx: number) {
    setOptionRows((s) => s.filter((_, i) => i !== idx));
  }
  function setOption(idx: number, key: "location" | "date", value: string) {
    setOptionRows((s) => {
      const copy = [...s];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }

  async function handleCreateDrive(e: React.FormEvent) {
    e.preventDefault();
    if (!title || optionRows.length === 0 || optionRows.some((o) => !o.location)) {
      toast.error("Add a title and at least one option with a location");
      return;
    }

    const payload = {
      title,
      description,
      options: optionRows.map((o) => ({ location: o.location, date: o.date || undefined })),
    };

    try {
      const res = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Create failed");
      toast.success("Drive created");
      setTitle("");
      setDescription("");
      setOptionRows([{ location: "", date: "" }]);
      await loadDrives();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create drive");
    }
  }

  async function handleVote(optionId: string) {
    if (!voter) {
      toast.error("Please enter your name/email to vote");
      return;
    }

    try {
      const res = await fetch(`/api/drives/${getDriveIdForOption(optionId)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, voter }),
      });
      if (res.status === 409) {
        toast.error("You already voted for this option");
        return;
      }
      if (!res.ok) throw new Error("Vote failed");
      toast.success("Vote recorded");
      await loadDrives();
    } catch (err) {
      console.error(err);
      toast.error("Failed to vote");
    }
  }

  function getDriveIdForOption(optionId: string) {
    for (const d of drives) {
      if (d.options.some((o) => o.id === optionId)) return d.id;
    }
    throw new Error("Drive not found for option");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Community Drives</h1>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Create a Drive</h2>
        <form onSubmit={handleCreateDrive} className="space-y-3 bg-white p-4 rounded shadow">
          <Input placeholder="Drive title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <label className="block mb-1 font-medium">Options (location + optional date)</label>
            {optionRows.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Location (e.g. Community Center)"
                  value={opt.location}
                  onChange={(e) => setOption(idx, "location", e.target.value)}
                />
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={opt.date || ""}
                  onChange={(e) => setOption(idx, "date", e.target.value)}
                />
                {optionRows.length > 1 && (
                  <button type="button" onClick={() => removeOptionRow(idx)} className="text-red-500">Remove</button>
                )}
              </div>
            ))}
            <div>
              <button type="button" onClick={addOptionRow} className="text-sm text-blue-600">+ Add another option</button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Create Drive</Button>
            <button type="button" onClick={() => { setTitle(""); setDescription(""); setOptionRows([{ location: "", date: "" }]); }} className="px-3 py-2 border rounded">Reset</button>
          </div>
        </form>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Your voter identity</h2>
        <input className="border rounded px-2 py-1 w-full mb-2" placeholder="Your name or email (used to track vote)" value={voter} onChange={(e) => setVoter(e.target.value)} />
        <div className="text-xs text-gray-500">In production, replace this with authenticated user id.</div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Active Drives</h2>
        {loading ? <div>Loading...</div> : drives.length === 0 ? <div>No drives yet</div> : drives.map((d) => (
          <div key={d.id} className="border rounded p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{d.title}</h3>
                <div className="text-sm text-gray-600">{d.description}</div>
              </div>
              <div className="text-sm text-gray-500">Created: {new Date(d.createdAt).toLocaleString()}</div>
            </div>

            <div className="mt-3">
              <h4 className="font-medium mb-2">Options</h4>
              <div className="space-y-2">
                {d.options.map((o) => (
                  <div key={o.id} className="flex items-center justify-between border p-2 rounded">
                    <div>
                      <div className="font-medium">{o.location}</div>
                      <div className="text-sm text-gray-500">{o.date ? new Date(o.date).toLocaleString() : "No date suggested"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm">{o.votes.length} votes</div>
                      <button onClick={() => handleVote(o.id)} className="px-3 py-1 border rounded">Vote</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
