"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { TaskStatus, EngagementLevel } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  engagement: EngagementLevel;
  timeSlot: string | null;
  volunteer?: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
}

export default function ReportTasksPage() {
  const { id: reportId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/tasks`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data: Task[] = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) fetchTasks();
  }, [reportId]);

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks for Report</h1>
        <Button asChild>
          <Link href={`/reports/${reportId}`}>⬅ Back to Report</Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks found for this report.</p>
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
