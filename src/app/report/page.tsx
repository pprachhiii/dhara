"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Report } from "@/lib/types";

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [form, setForm] = useState({
    reporter: "",
    title: "",
    description: "",
    imageUrl: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

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
      // PATCH (update existing)
      await fetch(`/api/reports/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      // POST (new report)
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    // Reset form + reload
    setForm({ reporter: "", title: "", description: "", imageUrl: "" });
    loadReports();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    loadReports();
  }

  async function handleEdit(report: Report) {
    setEditingId(report.id);
    setForm({
      reporter: report.reporter,
      title: report.title,
      description: report.description,
      imageUrl: report.imageUrl ?? "",
    });
  }

  async function handleSee(id: string) {
    const res = await fetch(`/api/reports/${id}`);
    const single = await res.json();
    alert(
      `📌 ${single.title}\nBy: ${single.reporter}\n\n${single.description}`
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🌍 Report an Area</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <Button type="submit" className="w-full">
          {editingId ? "Update Report" : "Submit Report"}
        </Button>
      </form>

      {/* Reports list */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Reports</h2>
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

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => handleSee(r.id)}>
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
  );
}
