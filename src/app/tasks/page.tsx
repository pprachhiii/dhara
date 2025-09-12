"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import CreateForm from "@/components/CreateForm";
import { Task, TaskStatus, SocializingLevel } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [comfortFilter, setComfortFilter] = useState<SocializingLevel | "">("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const loadTasks = useCallback(async () => {
    const query = new URLSearchParams();
    if (statusFilter) query.append("status", statusFilter);
    if (comfortFilter) query.append("comfort", comfortFilter);
    if (searchQuery) query.append("search", searchQuery);

    try {
      const data: Task[] = await fetch(`/api/tasks?${query.toString()}`).then(
        (res) => res.json()
      );
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    }
  }, [statusFilter, comfortFilter, searchQuery]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function refreshTasks() {
    await loadTasks();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    toast("🗑️ Task deleted");
    await refreshTasks();
    setSelectedTask(null);
  }

  return (
    <div className="h-screen overflow-y-auto p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => setCreatingTask(true)}>Create Task</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Input
          placeholder="Search by report/drive/form?model=Volunteer"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />

        {/* Status Filter */}
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : (v as TaskStatus))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(TaskStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Comfort Filter */}
        <Select
          value={comfortFilter || "all"}
          onValueChange={(v) =>
            setComfortFilter(v === "all" ? "" : (v as SocializingLevel))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Comfort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comfort</SelectItem>
            {Object.values(SocializingLevel).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Comfort</th>
              <th className="px-4 py-2 border">Time Slot</th>
              <th className="px-4 py-2 border">Report</th>
              <th className="px-4 py-2 border">Drive</th>
              <th className="px-4 py-2 border">Volunteer</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{t.status}</td>
                <td className="px-4 py-2 border">{t.comfort ?? "-"}</td>
                <td className="px-4 py-2 border">
                  {t.timeSlot ? new Date(t.timeSlot).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2 border">{t.report?.title ?? "-"}</td>
                <td className="px-4 py-2 border">{t.drive?.title ?? "-"}</td>
                <td className="px-4 py-2 border">{t.volunteer?.user.name ?? "-"}</td>
                <td className="px-4 py-2 border flex gap-2">
                  <Button size="sm" onClick={() => setSelectedTask(t)}>
                    See
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTask(t)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Task Details */}
      {selectedTask && !editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setSelectedTask(null)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">Task</h2>
            <p>Status: {selectedTask.status}</p>
            <p>Comfort: {selectedTask.comfort ?? "-"}</p>
            <p>
              Time Slot:{" "}
              {selectedTask.timeSlot
                ? new Date(selectedTask.timeSlot).toLocaleString()
                : "-"}
            </p>
            <p>Report: {selectedTask.report?.title ?? "-"}</p>
            <p>Drive: {selectedTask.drive?.title ?? "-"}</p>
            <p>Volunteer: {selectedTask.volunteer?.user.name ?? "-"}</p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingTask(selectedTask)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedTask.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setEditingTask(null)}
            >
              ✕
            </button>

            <CreateForm
              model="Task"
              initialValues={{
                id: editingTask.id,
                status: editingTask.status,
                comfort: editingTask.comfort,
                timeSlot: editingTask.timeSlot
                  ? new Date(editingTask.timeSlot).toISOString()
                  : undefined,
                reportId: editingTask.reportId ?? undefined,
                driveId: editingTask.driveId ?? undefined,
                volunteerId: editingTask.volunteerId ?? undefined,
              }}
              onClose={() => setEditingTask(null)}
              onSuccess={async () => {
                setEditingTask(null);
                setSelectedTask(null);
                await refreshTasks();
              }}
            />
          </div>
        </div>
      )}

      {/* Create Task Form */}
      {creatingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setCreatingTask(false)}
            >
              ✕
            </button>

            <CreateForm
              model="Task"
              onClose={() => setCreatingTask(false)}
              onSuccess={async () => {
                setCreatingTask(false);
                await refreshTasks();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
