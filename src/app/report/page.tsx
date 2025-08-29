"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Report } from "@/lib/types";
import toast from "react-hot-toast";

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [form, setForm] = useState({
    reporter: "",
    title: "",
    description: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const data: Report[] = await fetch("/api/reports").then((res) =>
      res.json()
    );
    setReports(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      await fetch(`/api/reports/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("✅ Report updated successfully!");
      setEditingId(null);
    } else {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("🎉 Report submitted!");
    }

    setForm({ reporter: "", title: "", description: "", imageUrl: "" });
    setShowForm(false);
    loadReports();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    toast("🗑️ Report deleted");
    loadReports();
  }

  function handleEdit(report: Report) {
    setEditingId(report.id);
    setForm({
      reporter: report.reporter,
      title: report.title,
      description: report.description,
      imageUrl: report.imageUrl ?? "",
    });
    setShowForm(true);
  }

  async function handleSee(report: Report) {
    // Show report info as a toast instead of alert
    toast(
      <div className="text-left">
        <strong>{report.title}</strong>
        <p className="text-sm">By: {report.reporter}</p>
        <p>{report.description}</p>
      </div>,
      { duration: 5000 }
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel - Reports */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Community Reports</h1>
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
                <p className="text-sm text-gray-500 mt-2">
                  Status: {r.status}
                </p>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => handleSee(r)}>
                    See
                  </Button>
                  <Button variant="secondary" onClick={() => handleEdit(r)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div
        className={`transition-all duration-300 border-l bg-gray-50 p-4 
          ${showForm ? "w-1/4" : "w-16 flex items-start justify-center"}`}
      >
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <h2 className="text-xl font-semibold mb-2">
              {editingId ? "Edit Report" : "New Report"}
            </h2>
            <Input
              placeholder="Your name"
              value={form.reporter}
              onChange={(e) => setForm({ ...form, reporter: e.target.value })}
            />
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Close
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowForm(true)} className="mt-2">
            +
          </Button>
        )}
      </div>
    </div>
  );
}
