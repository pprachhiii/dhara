"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TaskStatus, EngagementLevel } from "@prisma/client";
import { Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  engagement: EngagementLevel;
  timeSlot: string | null;
  drive?: { id: string; title: string } | null;
  volunteer?: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
}

export default function TasksClient() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [reportTitle, setReportTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?reportId=${reportId}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data);

        const resReport = await fetch(`/api/reports/${reportId}`);
        if (resReport.ok) {
          const reportData = await resReport.json();
          setReportTitle(reportData.title);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [reportId]);

  if (!reportId) return <div>No report selected.</div>;
  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Tasks for Report: {reportTitle ?? reportId}
        </h1>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md"
          asChild
        >
          <Link href={`/form?model=Task&reportId=${reportId}`}>
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks yet for this report.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <p className="mt-2">
                  <strong>Status:</strong> {task.status}
                </p>
                <p>
                  <strong>Engagement:</strong> {task.engagement}
                </p>
                {task.timeSlot && (
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(task.timeSlot).toLocaleString()}
                  </p>
                )}
                {task.drive && (
                  <p>
                    <strong>Drive:</strong> {task.drive.title}
                  </p>
                )}
                {task.volunteer && (
                  <p>
                    <strong>Assigned To:</strong>{" "}
                    {task.volunteer.user.name ?? task.volunteer.user.email}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
