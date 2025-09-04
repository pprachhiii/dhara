"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";
import CreateForm from "@/components/CreateForm";
import { Drive } from "@/lib/types";

export default function DrivePage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null);
  const [creatingDrive, setCreatingDrive] = useState(false);

  useEffect(() => {
    const loadDrives = async () => {
      const query = new URLSearchParams();
      if (searchQuery) query.append("search", searchQuery);

      try {
        const data: Drive[] = await fetch(`/api/drives?${query.toString()}`).then((res) =>
          res.json()
        );
        setDrives(data);
      } catch {
        toast.error("Failed to load drives");
      }
    };
    loadDrives();
  }, [searchQuery]);

  async function refreshDrives() {
    const query = new URLSearchParams();
    if (searchQuery) query.append("search", searchQuery);

    const data: Drive[] = await fetch(`/api/drives?${query.toString()}`).then((res) => res.json());
    setDrives(data);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/drives/${id}`, { method: "DELETE" });
    toast("🗑️ Drive deleted");
    await refreshDrives();
    setSelectedDrive(null);
  }

  function closeModal() {
    setSelectedDrive(null);
  }

  return (
    <div className="h-screen overflow-y-auto p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Community Drives</h1>
        <div className="flex gap-3">
          <Button onClick={() => setCreatingDrive(true)}>Create Drive</Button>
          <Button asChild>
            <Link
              href="/reports"
              className="px-12 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Input
          placeholder="Search by title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-auto max-w-xs"
        />
      </div>

      {/* Drives Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Start Date</th>
              <th className="px-4 py-2 border">End Date</th>
              <th className="px-4 py-2 border">Participants</th>
              <th className="px-4 py-2 border">Reports</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drives.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{d.title}</td>
                <td className="px-4 py-2 border">{d.description}</td>
                <td className="px-4 py-2 border">
                  {new Date(d.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">
                  {d.endDate ? new Date(d.endDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2 border">{d.participant ?? 0}</td>
                <td className="px-4 py-2 border">
                  {d.reports && d.reports.length > 0 ? (
                    <ul className="list-disc list-inside text-sm">
                      {d.reports.map((r, idx) =>
                        r?.report ? (
                          <li key={r.report.id}>{r.report.title}</li>
                        ) : (
                          <li key={idx}>Unknown report</li>
                        )
                      )}
                    </ul>
                  ) : (
                    "No linked reports"
                  )}
                </td>
                <td className="px-4 py-2 border flex gap-2">
                  <Button size="sm" onClick={() => setSelectedDrive(d)}>
                    See
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingDrive(d)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Drive Details */}
      {selectedDrive && !editingDrive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedDrive.title}</h2>
            <p className="mb-4">{selectedDrive.description}</p>
            <p className="text-sm text-gray-500">
              Start: {new Date(selectedDrive.startDate).toLocaleDateString()}
            </p>
            {selectedDrive.endDate && (
              <p className="text-sm text-gray-500 mb-4">
                End: {new Date(selectedDrive.endDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-2">
              Participants: {selectedDrive.participant}
            </p>

            {selectedDrive.reports && selectedDrive.reports.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Linked Reports</h3>
                <ul className="list-disc list-inside text-sm">
                  {selectedDrive.reports.map((r, idx) =>
                    r?.report ? (
                      <li key={r.report.id}>{r.report.title}</li>
                    ) : (
                      <li key={idx}>Unknown report</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Close & Delete */}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingDrive(selectedDrive)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(selectedDrive.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingDrive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setEditingDrive(null)}
            >
              ✕
            </button>

            <CreateForm
              model="Drive"
              initialValues={{
                id: editingDrive.id,
                title: editingDrive.title,
                description: editingDrive.description,
                startDate: editingDrive.startDate,
                endDate: editingDrive.endDate,
                participant: editingDrive.participant,
              }}
              onClose={() => setEditingDrive(null)}
              onSuccess={async () => {
                setEditingDrive(null);
                setSelectedDrive(null);
                await refreshDrives();
              }}
            />
          </div>
        </div>
      )}

      {/* Create Drive Form */}
      {creatingDrive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setCreatingDrive(false)}
            >
              ✕
            </button>

            <CreateForm
              model="Drive"
              onClose={() => setCreatingDrive(false)}
              onSuccess={async () => {
                setCreatingDrive(false);
                await refreshDrives();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
