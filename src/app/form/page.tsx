"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CreateForm from "@/components/CreateForm"; 

type ModelType = "Task" | "Drive" | "Authority";

function FormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryModel = (searchParams.get("model") as ModelType) || "Task"; // default to Task

  const [model, setModel] = useState<ModelType>(queryModel);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const urlModel = (searchParams.get("model") as ModelType) || "Task";
    setModel(urlModel);
  }, [searchParams]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <CreateForm
        model={model}
        initialValues={{}}
        disableFields={[]}
        onSuccess={() => {
          toast.success(`${model} created successfully!`);
          router.push(`/${model.toLowerCase()}`);
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
