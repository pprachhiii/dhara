"use client";

import { Suspense } from "react";
import DriveForm from "@/components/DriveForm";

export default function NewdrivePage() {
  return (
    <Suspense fallback={<div>Loading drive form...</div>}>
      <DriveForm />
    </Suspense>
  );
}
