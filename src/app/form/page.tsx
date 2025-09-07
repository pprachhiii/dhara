"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateForm from "@/components/CreateForm";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

type ModelType = "Report" | "Task" | "Drive" | "Authority";

function FormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryModel = (searchParams.get("model") as ModelType) || "Report";
  const [model, setModel] = useState<ModelType>(queryModel);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("You must be logged in to submit a report");
      router.push("/auth/login");
    }
  }, [status, router]);

  // Sync URL query param with state
  useEffect(() => {
    const urlModel = (searchParams.get("model") as ModelType) || "Report";
    setModel(urlModel);
  }, [searchParams]);

  // Show loading while session is loading
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Redirect already handled, just render nothing
    return null;
  }

  // Initial values for the form
  const initialValues = model === "Report" ? { reporterId: session.user.id } : {};

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
