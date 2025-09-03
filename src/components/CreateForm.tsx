"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TaskStatus, SocializingLevel, AuthorityType } from "@/lib/types";

type ModelType = "Report" | "Task" | "Drive" | "Authority";

// Generic FormState
type FormState = Record<string, string | number | undefined>;

interface CreateFormProps {
  model: ModelType;
}

// Runtime arrays for selects
const SOCIALIZING_LEVELS: SocializingLevel[] = ["SOLO", "DUAL", "GROUP"];
const TASK_STATUSES: TaskStatus[] = ["OPEN", "ASSIGNED", "DONE"];
const AUTHORITY_TYPES: AuthorityType[] = ["GOVERNMENT", "NGO", "OTHERS"];

export default function CreateForm({ model }: CreateFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({});

  const getFields = () => {
    switch (model) {
      case "Report":
        return [
          { name: "reporter", label: "Your Name", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "imageUrl", label: "Image URL", type: "text" },
        ];
      case "Task":
        return [
          { name: "reportId", label: "Report ID", type: "text" },
          { name: "comfort", label: "Comfort Level", type: "select", options: SOCIALIZING_LEVELS },
          { name: "assignedTo", label: "Assigned To", type: "text" },
          { name: "status", label: "Status", type: "select", options: TASK_STATUSES },
        ];
      case "Drive":
        return [
          { name: "participant", label: "Participant Count", type: "number" },
          { name: "date", label: "Date", type: "date" },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
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
    try {
      await fetch(`/api/${model.toLowerCase()}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(`${model} created successfully!`);
      router.push(`/${model.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create");
    }
  };

  const fields = getFields();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-6"
    >
      <h1 className="text-2xl font-bold mb-4">Create {model}</h1>
      {fields.map((field) => {
        const value = form[field.name] || "";

        if (field.type === "textarea") {
          return (
            <Textarea
              key={field.name}
              placeholder={field.label}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
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
            onChange={(e) =>
              handleChange(
                field.name,
                field.type === "number" ? Number(e.target.value) : e.target.value
              )
            }
          />
        );
      })}
      <Button type="submit" className="w-full mt-2">
        Submit {model}
      </Button>
    </form>
  );
}
