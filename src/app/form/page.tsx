"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CreateForm from "@/components/CreateForm";

type ModelType = "Report" | "Task" | "Drive" | "Authority";

function FormContent() {
  const searchParams = useSearchParams();
  const queryModel = (searchParams.get("model") as ModelType) || "Report";
  const [model, setModel] = useState<ModelType>(queryModel);

  // Sync URL query param with state
  useEffect(() => {
    const urlModel = (searchParams.get("model") as ModelType) || "Report";
    setModel(urlModel);
  }, [searchParams]);

  return (
    <div className="p-6">
      

      {/* Render CreateForm */}
      <CreateForm model={model} />
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
