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
} from "@/lib/types";

// ------------ Types ------------
type ModelType = "Task" | "Authority" | "Volunteer";

// Specific form types
interface VolunteerForm {
  id?: string;
  userId: string;
  phone: string;
}

interface TaskForm {
  id?: string;
  reportId: string;
  driveId: string;
  volunteerId: string;
  comfort: SocializingLevel;
  status: TaskStatus;
  timeSlot: string | Date;
}

interface AuthorityForm {
  id?: string;
  name: string;
  type: AuthorityType;
  city: string;
  region: string;
  email: string;
  phone: string;
  website?: string;
  active: boolean | string; // string for select, normalized before submit
}

// Union type
type FormState = VolunteerForm | TaskForm | AuthorityForm;

interface CreateFormProps<T extends FormState> {
  model: ModelType;
  initialValues?: Partial<T>;
  disableFields?: (keyof T)[];
  onClose?: () => void;
  onSuccess?: () => void;
}

// ------------ Constants ------------
const SOCIALIZING_LEVELS: SocializingLevel[] = Object.values(SocializingLevel);
const TASK_STATUSES: TaskStatus[] = Object.values(TaskStatus);
const AUTHORITY_TYPES: AuthorityType[] = Object.values(AuthorityType);

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "datetime-local" | "select";
  options?: readonly string[];
}

// ------------ Component ------------
export default function CreateForm<T extends FormState>({
  model,
  initialValues = {} as Partial<T>,
  disableFields = [],
  onClose,
  onSuccess,
}: CreateFormProps<T>) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<T>>({ ...initialValues });

  useEffect(() => {
    setForm({ ...initialValues });
  }, [initialValues, model]);

  const isEdit = Boolean(initialValues?.id);

  // Format dates for datetime-local inputs
  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const getFields = (): Field[] => {
    switch (model) {
      case "Volunteer":
        return [
          { name: "userId", label: "User ID", type: "text" },
          { name: "phone", label: "Phone", type: "text" },
        ];
      case "Task":
        return [
          { name: "reportId", label: "Report ID", type: "text" },
          { name: "driveId", label: "Drive ID", type: "text" },
          { name: "volunteerId", label: "Volunteer ID", type: "text" },
          {
            name: "comfort",
            label: "Comfort Level",
            type: "select",
            options: SOCIALIZING_LEVELS,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: TASK_STATUSES,
          },
          {
            name: "timeSlot",
            label: "Time Slot (DateTime)",
            type: "datetime-local",
          },
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

    const endpointMap: Record<ModelType, string> = {
      Volunteer: isEdit
        ? `/api/volunteers/${initialValues?.id}`
        : "/api/volunteers",
      Task: isEdit ? `/api/tasks/${initialValues?.id}` : "/api/tasks",
      Authority: isEdit
        ? `/api/authority/${initialValues?.id}`
        : "/api/authority",
    };

    // Prepare form data before sending
    const submitData: Record<string, unknown> = { ...form };

    // Convert boolean
    if ("active" in submitData) {
      submitData.active =
        submitData.active === "true" || submitData.active === true;
    }

    // Convert datetime-local back to Date
    if ("timeSlot" in submitData && submitData.timeSlot) {
      submitData.timeSlot = new Date(submitData.timeSlot as string);
    }

    try {
      const res = await fetch(endpointMap[model], {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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
        {isEdit ? `Edit ${model}` : `Create ${model}`}
      </h1>

      {fields.map((field) => {
        const value = form[field.name as keyof T] ?? "";

        if (field.type === "textarea") {
          return (
            <Textarea
              key={field.name}
              placeholder={field.label}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={disableFields.includes(field.name as keyof T)}
            />
          );
        }

        if (field.type === "select") {
          return (
            <select
              key={field.name}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="border p-2 rounded w-full"
              disabled={disableFields.includes(field.name as keyof T)}
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
            value={
              field.type === "datetime-local"
                ? formatDateTime(value as string | Date)
                : String(value)
            }
            disabled={disableFields.includes(field.name as keyof T)}
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
          {isEdit ? "Update" : "Submit"} {model}
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
