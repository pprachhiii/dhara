"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateForm from "@/components/CreateForm";
import { toast } from "react-hot-toast";

type ModelType = "Report" | "Task" | "Drive" | "Authority";

function FormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryModel = (searchParams.get("model") as ModelType) || "Report";

  const [model, setModel] = useState<ModelType>(queryModel);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user login and set userId
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to submit a report");
      router.push("/auth/login");
      return;
    }

    // Replace with real user ID fetching logic if available
    setUserId("current-user-id");
    setLoading(false);
  }, [router]);

  // Sync model with URL query param
  useEffect(() => {
    const urlModel = (searchParams.get("model") as ModelType) || "Report";
    setModel(urlModel);
  }, [searchParams]);

  if (loading) return <div>Loading...</div>;

  // Always create mode: never include `id`
  const initialValues = model === "Report" && userId ? { reporterId: userId } : {};

  return (
    <div className="p-6">
      <CreateForm
        key={model + userId} // ensures form resets when model or user changes
        model={model}
        initialValues={initialValues}
        disableFields={model === "Report" ? ["reporterId"] : []}
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
