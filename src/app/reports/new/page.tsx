"use client";

import { Suspense } from "react";
import ReportForm from "@/components/ReportForm";

export default function NewReportPage() {
  return (
    <Suspense fallback={<div>Loading report form...</div>}>
      <ReportForm />
    </Suspense>
  );
}
