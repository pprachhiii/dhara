import { Suspense } from "react";
import TasksClient from "@/components/Task";

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <TasksClient />
    </Suspense>
  );
}
