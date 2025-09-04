"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  TaskStatus,
  SocializingLevel,
  AuthorityType,
  ReportStatus,
  DriveStatus,
} from "@/lib/types";

type ModelType = "Report" | "Task" | "Drive" | "Authority";
type FormState = Record<string, string | number | undefined>;

interface CreateFormProps {
  model: ModelType;
  initialValues?: FormState;
  disableFields?: string[];
  onClose?: () => void;
  onSuccess?: () => void;
}

const SOCIALIZING_LEVELS = Object.values(SocializingLevel);
const TASK_STATUSES = Object.values(TaskStatus);
const AUTHORITY_TYPES = Object.values(AuthorityType);
const REPORT_STATUSES = Object.values(ReportStatus);
const DRIVE_STATUSES = Object.values(DriveStatus);

export default function CreateForm({
  model,
  initialValues,
  disableFields = [],
  onClose,
  onSuccess,
}: CreateFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialValues || {});

  // Sync form with initialValues when editing
  useEffect(() => {
    if (initialValues) setForm(initialValues);
  }, [initialValues]);

  const getFields = () => {
    switch (model) {
      case "Report":
        return [
          { name: "reporter", label: "Your Name", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "imageUrl", label: "Image URL", type: "text" },
          { name: "status", label: "Status", type: "select", options: REPORT_STATUSES },
        ];
      case "Task":
        return [
          { name: "reportId", label: "Report ID", type: "text" },
          { name: "driveId", label: "Drive ID", type: "text" },
          { name: "volunteerId", label: "Assigned To (Volunteer ID)", type: "text" },
          { name: "comfort", label: "Comfort Level", type: "select", options: SOCIALIZING_LEVELS },
          { name: "status", label: "Status", type: "select", options: TASK_STATUSES },
          { name: "timeSlot", label: "Time Slot", type: "text" },
        ];
      case "Drive":
        return [
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "participant", label: "Participant Count", type: "number" },
          { name: "startDate", label: "Start Date", type: "date" },
          { name: "endDate", label: "End Date", type: "date" },
          { name: "status", label: "Status", type: "select", options: DRIVE_STATUSES },
        ];
      case "Authority":
        return [
          { name: "name", label: "Name", type: "text" },
          { name: "type", label: "Type", type: "select", options: AUTHORITY_TYPES },
          { name: "city", label: "City", type: "text" },
          { name: "region", label: "Region", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "website", label: "Website", type: "text" },
          { name: "active", label: "Active", type: "select", options: ["true", "false"] },
        ];
      default:
        return [];
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = !!initialValues && !!initialValues.id;
    const endpointMap: Record<ModelType, string> = {
      Report: isEdit ? `/api/reports/${initialValues?.id}` : "/api/reports",
      Task: isEdit ? `/api/tasks/${initialValues?.id}` : "/api/tasks",
      Drive: isEdit ? `/api/drives/${initialValues?.id}` : "/api/drives",
      Authority: isEdit ? `/api/authority/${initialValues?.id}` : "/api/authority",
    };

    try {
      const res = await fetch(endpointMap[model], {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      toast.success(`${model} ${isEdit ? "updated" : "created"} successfully!`);
      onSuccess?.();
      onClose?.();
      if (!isEdit) router.push(`/${model.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} ${model}`);
    }
  };

  const fields = getFields();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-6"
    >
      <h1 className="text-2xl font-bold mb-4">
        {initialValues ? `Edit ${model}` : `Create ${model}`}
      </h1>

      {fields.map((field) => {
        const value = form[field.name] ?? "";

        if (field.type === "textarea") {
          return (
            <Textarea
              key={field.name}
              placeholder={field.label}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={disableFields.includes(field.name)}
            />
          );
        }

        if (field.type === "select") {
          return (
            <select
              key={field.name}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="border p-2 rounded w-full"
              disabled={disableFields.includes(field.name)}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }

        return (
          <Input
            key={field.name}
            type={field.type}
            placeholder={field.label}
            value={value}
            disabled={disableFields.includes(field.name)}
            onChange={(e) =>
              handleChange(
                field.name,
                field.type === "number" ? Number(e.target.value) : e.target.value
              )
            }
          />
        );
      })}

      <div className="flex gap-2 mt-2">
        <Button type="submit" className="flex-1">
          {initialValues ? "Update" : "Submit"} {model}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
