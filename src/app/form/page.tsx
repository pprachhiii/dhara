"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CreateForm from "@/components/CreateForm";

type ModelType = "Task" | "Authority";

function FormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryModel = (searchParams.get("model") as ModelType) || "Task";
  const queryId = searchParams.get("id"); 
  const queryReportId = searchParams.get("reportId");

  const [model, setModel] = useState<ModelType>(queryModel);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          toast.error("You must be logged in to submit a form");
          router.push("/auth/login");
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        toast.error("Session expired, please login again.");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Update model if URL changes
  useEffect(() => {
    const urlModel = (searchParams.get("model") as ModelType) || "Task";
    setModel(urlModel);
  }, [searchParams]);

  // Fetch initial data if editing
  useEffect(() => {
    if (!queryId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/${model.toLowerCase()}/${queryId}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setInitialValues(data);
      } catch (err) {
        console.error("Failed to load record:", err);
        toast.error("Could not load record for editing.");
      }
    };

    fetchData();
  }, [queryId, model]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <CreateForm
        model={model}
        initialValues={{
          ...initialValues,
          // Pass reportId from URL if creating a new Task
          reportId: queryReportId ?? (initialValues.reportId as string | undefined),
        }}
        disableFields={[]}
        onSuccess={() => {
          toast.success(
            `${model} ${queryId ? "updated" : "created"} successfully!`
          );
          if (model === "Task" && queryReportId) {
            router.push(`/tasks?reportId=${queryReportId}`);
          } else {
            router.push(`/${model.toLowerCase()}`);
          }
        }}
      />
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <FormContent />
    </Suspense>
  );
}
