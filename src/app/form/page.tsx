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

  // Check if user is logged in using localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to submit a report");
      router.push("/api/auth/login");
      return;
    }

    // Optional: you can decode token or fetch user info
    // For simplicity, just store a fake user ID
    setUserId("current-user-id"); // replace with real user ID if available
    setLoading(false);
  }, [router]);

  // Sync URL query param with state
  useEffect(() => {
    const urlModel = (searchParams.get("model") as ModelType) || "Report";
    setModel(urlModel);
  }, [searchParams]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Initial values for the form
  const initialValues =
    model === "Report" && userId ? { reporterId: userId } : {};

  return (
    <div className="p-6">
      <CreateForm
        model={model}
        initialValues={initialValues}
        disableFields={model === "Report" ? ["reporterId"] : []} // hide reporterId
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
