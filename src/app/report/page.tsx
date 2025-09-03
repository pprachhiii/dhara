"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Report } from "@/lib/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const statuses = ["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "AUTHORITY_CONTACTED"];

  useEffect(() => {
    const loadReports = async () => {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (searchQuery) query.append("search", searchQuery);

      const data: Report[] = await fetch(`/api/reports?${query.toString()}`).then(
        (res) => res.json()
      );
      setReports(data);
    };

    loadReports();
  }, [statusFilter, searchQuery]);

  async function handleDelete(id: string) {
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    toast("🗑️ Report deleted");

    const query = new URLSearchParams();
    if (statusFilter !== "ALL") query.append("status", statusFilter);
    if (searchQuery) query.append("search", searchQuery);

    const data: Report[] = await fetch(`/api/reports?${query.toString()}`).then(
      (res) => res.json()
    );
    setReports(data);
  }

  function handleSee(report: Report) {
    setSelectedReport(report);
  }

  function closeModal() {
    setSelectedReport(null);
  }

  return (
    <div className="h-screen overflow-y-auto p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Community Reports</h1>
        <Button asChild>
          <Link href="/authority" className="px-12 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition">View Authorities</Link>
        </Button>
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

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>{r.title}</CardTitle>
              <p className="text-sm text-gray-500">By {r.reporter}</p>
            </CardHeader>
            <CardContent>
              <p>{r.description}</p>
              {r.imageUrl && (
                <div className="relative w-full h-48 mt-2">
                  <Image
                    src={r.imageUrl}
                    alt="report"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">Status: {r.status}</p>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => handleSee(r)}>
                  See
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(r.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
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
            <p className="text-sm text-gray-500">Status: {selectedReport.status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
