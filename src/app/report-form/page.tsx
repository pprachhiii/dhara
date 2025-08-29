"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function NewReportPage() {
  const [form, setForm] = useState({
    reporter: "",
    title: "",
    description: "",
    imageUrl: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    toast.success("🎉 Report submitted!");
    router.push("/report");
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">New Report</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Your Name"
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
        <Button type="submit" className="w-full">
          Submit Report
        </Button>
      </form>
    </div>
  );
}
