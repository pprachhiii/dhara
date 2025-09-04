"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Report, ReportStatus } from "@/lib/types";
import toast from "react-hot-toast";
import CreateForm from "@/components/CreateForm";

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [creatingDrive, setCreatingDrive] = useState<Report | null>(null); // New state
  const [creatingReport, setCreatingReport] = useState(false);

  const statuses: (ReportStatus | "ALL")[] = ["ALL", ...Object.values(ReportStatus)];

  useEffect(() => {
    const loadReports = async () => {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (searchQuery) query.append("search", searchQuery);

      try {
        const data: Report[] = await fetch(`/api/reports?${query.toString()}`).then(res => res.json());
        setReports(data);
      } catch {
        toast.error("Failed to load reports");
      }
    };
    loadReports();
  }, [statusFilter, searchQuery]);

  async function refreshReports() {
    const query = new URLSearchParams();
    if (statusFilter !== "ALL") query.append("status", statusFilter);
    if (searchQuery) query.append("search", searchQuery);

    const data: Report[] = await fetch(`/api/reports?${query.toString()}`).then(res => res.json());
    setReports(data);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    toast("🗑️ Report deleted");
    await refreshReports();
    setSelectedReport(null);
  }

  async function handleStatusChange(id: string, newStatus: ReportStatus) {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      toast.success("✅ Status updated");
      await refreshReports();
      if (selectedReport?.id === id) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      toast.error("❌ Failed to update status");
    }
  }

  function closeModal() {
    setSelectedReport(null);
  }

  return (
    <div className="h-screen overflow-y-auto p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold">Community Reports</h1>
  <div className="flex gap-3">
    <Button onClick={() => setCreatingReport(true)}>
      Create Report
    </Button>
    <Button asChild>
      <Link
        href="/authority"
        className="px-12 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
      >
        View Authorities
      </Link>
    </Button>
  </div>
</div>


      {/* Filters & Search */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status === "ALL" ? "All Reports" : status.replace("_", " ")}
          </Button>
        ))}
        <Input
          placeholder="Search by title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-auto max-w-xs"
        />
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Reporter</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{r.title}</td>
                <td className="px-4 py-2 border">{r.reporter}</td>
                <td className="px-4 py-2 border">{r.description}</td>
                <td className="px-4 py-2 border">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as ReportStatus)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {Object.values(ReportStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  {r.imageUrl && (
                    <div className="relative w-24 h-16">
                      <Image src={r.imageUrl} alt="report" fill className="object-cover rounded" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 border flex gap-2">
                  <Button size="sm" onClick={() => setSelectedReport(r)}>
                    See
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setCreatingDrive(r)}>
                    Create Drive
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Report Details */}
      {selectedReport && !editingReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedReport.title}</h2>
            <p className="text-sm text-gray-500 mb-4">By {selectedReport.reporter}</p>
            <p className="mb-4">{selectedReport.description}</p>
            {selectedReport.imageUrl && (
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={selectedReport.imageUrl}
                  alt="report"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            <p className="text-sm text-gray-500 mb-2">Status: {selectedReport.status}</p>

            {selectedReport.tasks && selectedReport.tasks.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tasks</h3>
                <ul className="list-disc list-inside text-sm">
                  {selectedReport.tasks.map((t) => (
                    <li key={t.id}>
                      Task: {t.id}, Status: {t.status}, Comfort: {t.comfort}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedReport.drives && selectedReport.drives.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Drives</h3>
                <ul className="list-disc list-inside text-sm">
                  {selectedReport.drives.map((d) => (
                    <li key={d.id}>Drive ID: {d.id}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Edit & Delete Buttons */}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingReport(selectedReport)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedReport.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setEditingReport(null)}
            >
              ✕
            </button>

            <CreateForm
              model="Report"
              initialValues={{
                id: editingReport.id,
                reporter: editingReport.reporter,
                title: editingReport.title,
                description: editingReport.description,
                imageUrl: editingReport.imageUrl,
                status: editingReport.status,
              }}
              disableFields={["status"]}
              onClose={() => setEditingReport(null)}
              onSuccess={async () => {
                setEditingReport(null);
                setSelectedReport(null);
                await refreshReports();
              }}
            />
          </div>
        </div>
      )}

      {/* Create Drive Form Modal */}
      {creatingDrive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setCreatingDrive(null)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">
              Create Drive for `{creatingDrive.title}``
            </h2>

            <CreateForm
              model="Drive"
              initialValues={{
                reportId: creatingDrive.id,
                title: `${creatingDrive.title} Drive`,
              }}
              onClose={() => setCreatingDrive(null)}
              onSuccess={async () => {
                setCreatingDrive(null);
                toast.success("Drive created successfully!");
              }}
            />
          </div>
        </div>
      )}
      {/* Create Report Form Modal */}
      {creatingReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setCreatingReport(false)}
            >
              ✕
            </button>

            <CreateForm
              model="Report"
              onClose={() => setCreatingReport(false)}
              onSuccess={async () => {
                setCreatingReport(false);
                await refreshReports();
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
