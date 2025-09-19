"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  TaskStatus,
  EngagementLevel,
  AuthorityCategory,
  AuthorityRole,
} from "@/lib/types";

type ModelType = "Task" | "Authority";

interface TaskForm {
  id?: string;
  title: string;
  description: string;
  reportId?: string;
  driveId?: string;
  volunteerId?: string;
  engagement: EngagementLevel;
  status: TaskStatus;
  timeSlot?: string | Date;
}

interface AuthorityForm {
  id?: string;
  name: string;
  category: AuthorityCategory;
  role: AuthorityRole;
  city: string;
  region?: string;
  email?: string;
  phone?: string;
  website?: string;
  active: boolean | string;
}

type FormState = TaskForm | AuthorityForm;

interface CreateFormProps<T extends FormState> {
  model: ModelType;
  initialValues?: Partial<T>;
  disableFields?: (keyof T)[];
  onClose?: () => void;
  onSuccess?: () => void;
}

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "datetime-local" | "select" | "hidden";
  options?: readonly string[];
}

interface NominatimResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

const ENGAGEMENT_LEVELS: EngagementLevel[] = Object.values(EngagementLevel);
const TASK_STATUSES: TaskStatus[] = Object.values(TaskStatus);
const AUTHORITY_CATEGORIES: AuthorityCategory[] = Object.values(AuthorityCategory);
const AUTHORITY_ROLES: AuthorityRole[] = Object.values(AuthorityRole);

// Reducer
type FormAction<T> =
  | { type: "SET"; payload: Partial<T> }
  | { type: "UPDATE"; field: keyof T; value: string | number | boolean };

function formReducer<T extends FormState>(
  state: Partial<T>,
  action: FormAction<T>
): Partial<T> {
  switch (action.type) {
    case "SET":
      return { ...action.payload };
    case "UPDATE":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

// Deep equal helper
function isEqual<T>(obj1: T, obj2: T): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export default function CreateForm<T extends FormState>({
  model,
  initialValues = {} as Partial<T>,
  disableFields = [],
  onClose,
  onSuccess,
}: CreateFormProps<T>) {
  const router = useRouter();
  
  // Initialize title/description as empty strings if undefined
  const defaultValues: Partial<T> = {
    ...(model === "Task"
      ? { title: "", description: "" }
      : {}),
    ...initialValues,
  };

  const [form, dispatch] = useReducer(formReducer<T>, { ...defaultValues });
  const prevInitialValues = useRef<Partial<T>>({ ...defaultValues });

  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);

  const isEdit = Boolean(initialValues?.id);

  useEffect(() => {
    if (!isEqual(prevInitialValues.current, initialValues)) {
      const updatedDefaults: Partial<T> = {
        ...(model === "Task"
          ? { title: "", description: "" }
          : {}),
        ...initialValues,
      };
      dispatch({ type: "SET", payload: updatedDefaults });
      prevInitialValues.current = updatedDefaults;
    }
  }, [initialValues, model]);

  // City autocomplete for Authority
  useEffect(() => {
    if (!cityQuery || cityQuery.length < 2 || model !== "Authority") return;
    const controller = new AbortController();

    fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
        cityQuery
      )}&format=json&addressdetails=1`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data: NominatimResult[]) => setCityResults(data))
      .catch(() => {});

    return () => controller.abort();
  }, [cityQuery, model]);

  const handleCitySelect = (c: NominatimResult) => {
    dispatch({
      type: "SET",
      payload: {
        ...form,
        city: c.address.city || c.address.town || c.address.village || "",
        region: c.address.state || "",
      } as Partial<T>,
    });
    setCityQuery(c.address.city || c.address.town || c.address.village || "");
    setCityResults([]);
  };

  // Fields
  const getFields = (): Field[] => {
    if (model === "Task") {
      return [
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "reportId", label: "Report ID", type: "hidden" },
        { name: "driveId", label: "Drive ID", type: "hidden" },
        { name: "volunteerId", label: "Volunteer ID", type: "hidden" },
        {
          name: "engagement",
          label: "Engagement",
          type: "select",
          options: ENGAGEMENT_LEVELS,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: TASK_STATUSES,
        },
        { name: "timeSlot", label: "Time Slot", type: "datetime-local" },
      ];
    } else if (model === "Authority") {
      return [
        { name: "name", label: "Name", type: "text" },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: AUTHORITY_CATEGORIES,
        },
        { name: "role", label: "Role", type: "select", options: AUTHORITY_ROLES },
        { name: "city", label: "City", type: "text" },
        { name: "region", label: "Region", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "website", label: "Website", type: "text" },
        {
          name: "active",
          label: "Active",
          type: "select",
          options: ["true", "false"],
        },
      ];
    }
    return [];
  };

  const handleChange = (name: keyof T, value: string | number | boolean) => {
    dispatch({ type: "UPDATE", field: name, value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const endpointMap: Record<ModelType, string> = {
      Task: isEdit ? `/api/tasks/${initialValues?.id}` : "/api/tasks",
      Authority: isEdit ? `/api/authority/${initialValues?.id}` : "/api/authority",
    };

    const submitData: Record<string, string | boolean | Date | undefined> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (key === "active") submitData[key] = value === "true" || value === true;
      else if (key === "timeSlot" && value)
        submitData[key] = new Date(value as string);
      else
        submitData[key] = value !== undefined ? value : ""; // <-- FIX: prevent Prisma default fallback
    });

    try {
      const res = await fetch(endpointMap[model], {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Request failed");
      }

      toast.success(`${model} ${isEdit ? "updated" : "created"} successfully!`);
      onSuccess?.();
      onClose?.();

      if (!isEdit) {
        if (model === "Task" && (form as Partial<TaskForm>).reportId) {
          router.push(`/tasks?reportId=${(form as Partial<TaskForm>).reportId}`);
        } else {
          router.push(`/${model.toLowerCase()}`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} ${model}`);
    }
  };

  const fields = getFields();

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 16);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-6"
    >
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? `Edit ${model}` : `Create ${model}`}
      </h1>

      {fields.map((field) => {
        if (field.type === "hidden") return null;

        const value = form[field.name as keyof T] ?? "";

        if (field.name === "city" && model === "Authority") {
          return (
            <div key="city" className="relative mb-3">
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <Input
                placeholder={field.label}
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                disabled={disableFields.includes(field.name as keyof T)}
              />
              {cityResults.length > 0 && (
                <ul className="absolute bg-white border rounded w-full max-h-40 overflow-y-auto z-10">
                  {cityResults.map((c, i) => (
                    <li
                      key={i}
                      className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCitySelect(c)}
                    >
                      {c.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.name} className="mb-3">
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <Textarea
                placeholder={field.label}
                value={String(value)}
                onChange={(e) => handleChange(field.name as keyof T, e.target.value)}
                disabled={disableFields.includes(field.name as keyof T)}
              />
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.name} className="mb-3">
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <select
                value={String(value)}
                onChange={(e) => handleChange(field.name as keyof T, e.target.value)}
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
            </div>
          );
        }

        return (
          <div key={field.name} className="mb-3">
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <Input
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
                  field.name as keyof T,
                  field.type === "number" ? Number(e.target.value) : e.target.value
                )
              }
            />
          </div>
        );
      })}

      <div className="flex gap-2 mt-4">
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
