"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CreateForm from "@/components/CreateForm";

type ModelType = "Report" | "Task" | "Drive" | "Authority";

export default function FormPage() {
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
      {/* Model Switch Buttons */}
      <div className="flex gap-4 mb-4">
        {(["Report", "Task", "Drive", "Authority"] as ModelType[]).map((m) => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className={`px-4 py-2 rounded ${
              model === m ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Render CreateForm */}
      <CreateForm model={model} />
    </div>
  );
}
