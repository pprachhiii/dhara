"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProposeDriveInput, useAppStore } from "@/lib/stores";
import { Users, Calendar, Plus, X, MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { SocializingLevel } from "@/lib/types";

interface TaskForm {
  title: string;
  description: string;
  comfortLevel: SocializingLevel;
}

interface DriveFormData {
  title: string;
  description: string;
  proposedDate: string;
  linkedReports: string[];
  taskBreakdown: TaskForm[];
}

interface DriveTaskPayload {
  title: string;
  description: string;
  comfort: SocializingLevel;
}

export interface BackendDriveResponse {
  id: string;
  title: string;
  description: string;
  proposedDate: string;
  reports: { reportId: string }[];
  taskBreakdown: DriveTaskPayload[];
}

export default function NewDrive() {
  const router = useRouter();
  const { reports, fetchReports, proposeDrive } = useAppStore();

  const [formData, setFormData] = useState<DriveFormData>({
    title: "",
    description: "",
    proposedDate: "",
    linkedReports: [],
    taskBreakdown: [],
  });

  const [currentTask, setCurrentTask] = useState<TaskForm>({
    title: "",
    description: "",
    comfortLevel: SocializingLevel.GROUP,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const eligibleReports = reports.filter((r) => r.status === "ELIGIBLE_DRIVE");

  const handleInputChange = (field: keyof DriveFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReportToggle = (reportId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedReports: prev.linkedReports.includes(reportId)
        ? prev.linkedReports.filter((id) => id !== reportId)
        : [...prev.linkedReports, reportId],
    }));
  };

  const handleAddTask = () => {
    if (!currentTask.title.trim() || !currentTask.description.trim()) {
      toast.error("Please fill in task title and description.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      taskBreakdown: [...prev.taskBreakdown, { ...currentTask }],
    }));

    setCurrentTask({
      title: "",
      description: "",
      comfortLevel: SocializingLevel.GROUP,
    });
  };

  const handleRemoveTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      taskBreakdown: prev.taskBreakdown.filter((_, i) => i !== index),
    }));
  };

  const getComfortLevelColor = (level: SocializingLevel) => {
    switch (level) {
      case SocializingLevel.SOLO:
        return "bg-blue-100 text-blue-800";
      case SocializingLevel.DUAL:
        return "bg-yellow-100 text-yellow-800";
      case SocializingLevel.GROUP:
        return "bg-green-100 text-green-800";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.proposedDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.taskBreakdown.length === 0) {
      toast.error("Please add at least one task.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        proposedDate: formData.proposedDate,
        linkedReports: formData.linkedReports,
        taskBreakdown: formData.taskBreakdown.map<DriveTaskPayload>((task) => ({
          title: task.title,
          description: task.description,
          comfort: task.comfortLevel,
        })),
      };

      const response = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData: { error?: string } = await response.json();
        throw new Error(errData.error || "Failed to create drive");
      }

      const createdDrive: BackendDriveResponse = await response.json();

      // Correctly map reports to linkedReports to prevent undefined errors
      const driveToStore: ProposeDriveInput = {
        title: createdDrive.title,
        description: createdDrive.description,
        proposedDate: new Date(createdDrive.proposedDate),
        linkedReports: createdDrive.reports.map((r) => r.reportId),
        status: "PLANNED",
        taskBreakdown: createdDrive.taskBreakdown.map((task) => ({
          id: crypto.randomUUID(),
          title: task.title,
          description: task.description,
          comfort: task.comfort,
          completed: false,
        })),
      };

      proposeDrive(driveToStore);



      toast.success("Drive created successfully!");
      router.push("/drives");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto forest-gradient rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Propose Community Drive</h1>
            <p className="text-muted-foreground">Organize community action to address environmental issues</p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Drive Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Drive Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Community Cleanup Drive"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the drive objectives..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Proposed Date */}
              <div className="space-y-2">
                <Label htmlFor="proposedDate">Proposed Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="proposedDate"
                    type="datetime-local"
                    value={formData.proposedDate}
                    onChange={(e) => handleInputChange("proposedDate", e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              {/* Linked Reports */}
              <div className="space-y-2">
                <Label>Linked Reports ({formData.linkedReports.length} selected)</Label>
                {eligibleReports.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {eligibleReports.map((report) => (
                      <div key={report.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`report-${report.id}`}
                          checked={formData.linkedReports.includes(report.id)}
                          onCheckedChange={() => handleReportToggle(report.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={`report-${report.id}`} className="text-sm font-medium cursor-pointer">
                            {report.title}
                          </label>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {report.city}, {report.region}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/20">
                    No reports available for linking.
                  </div>
                )}
              </div>

              {/* Task Breakdown */}
              <div className="space-y-4">
                <Label>Task Breakdown ({formData.taskBreakdown.length} tasks)</Label>

                {/* Add Task */}
                <Card className="bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="taskTitle" className="text-xs font-medium">
                            Task Title
                          </Label>
                          <Input
                            id="taskTitle"
                            placeholder="e.g., Waste Collection"
                            value={currentTask.title}
                            onChange={(e) =>
                              setCurrentTask((prev) => ({ ...prev, title: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="taskComfort" className="text-xs font-medium">
                            Comfort Level
                          </Label>
                          <Select
                            value={currentTask.comfortLevel}
                            onValueChange={(value: SocializingLevel) =>
                              setCurrentTask((prev) => ({ ...prev, comfortLevel: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SocializingLevel.SOLO}>Solo Work</SelectItem>
                              <SelectItem value={SocializingLevel.DUAL}>Low Social Interaction</SelectItem>
                              <SelectItem value={SocializingLevel.GROUP}>Group Activity</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="taskDescription" className="text-xs font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="taskDescription"
                          placeholder="Describe this task..."
                          value={currentTask.description}
                          onChange={(e) =>
                            setCurrentTask((prev) => ({ ...prev, description: e.target.value }))
                          }
                          rows={2}
                        />
                      </div>

                      <Button type="button" onClick={handleAddTask} variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Task List */}
                {formData.taskBreakdown.length > 0 && (
                  <div className="space-y-2">
                    {formData.taskBreakdown.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{task.title}</span>
                            <Badge className={getComfortLevelColor(task.comfortLevel)}>
                              {task.comfortLevel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTask(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full forest-gradient text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Drive..." : "Create Drive"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
