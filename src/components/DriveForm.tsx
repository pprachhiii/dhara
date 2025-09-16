"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProposeDriveInput, useAppStore } from "@/lib/stores";
import { Users, Calendar, Plus, X, MapPin, CheckCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { EngagementLevel, Drive, Task, DriveReport } from "@/lib/types";

interface TaskForm {
  title: string;
  description: string;
  comfortLevel: EngagementLevel;
  reportId: string;
}

interface DriveFormData {
  title: string;
  description: string;
  startDate: string;
  linkedReports: string[];
  taskBreakdown: TaskForm[];
}

export default function DriveForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = Boolean(editId);

  const { reports, fetchReports, proposeDrive } = useAppStore();

  const [formData, setFormData] = useState<DriveFormData>({
    title: "",
    description: "",
    startDate: "",
    linkedReports: [],
    taskBreakdown: [],
  });

  const [currentTask, setCurrentTask] = useState<TaskForm>({
    title: "",
    description: "",
    comfortLevel: EngagementLevel.GROUP,
    reportId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (!isEdit || !editId) return;
    (async () => {
      try {
        const res = await fetch(`/api/drives/${editId}`);
        if (!res.ok) throw new Error("Failed to fetch drive");
        const drive: Drive & { reports: DriveReport[]; tasks: Task[] } = await res.json();
        setFormData({
          title: drive.title,
          description: drive.description ?? "",
          startDate: drive.startDate ? new Date(drive.startDate).toISOString().slice(0, 16) : "",
          linkedReports: drive.reports.map((r) => r.reportId),
          taskBreakdown: drive.tasks.map((t) => ({
            title: t.title,
            description: t.description ?? "",
            comfortLevel: t.engagement,
            reportId: drive.reports[0]?.reportId ?? "",
          })),
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load drive data");
      }
    })();
  }, [isEdit, editId]);

  const eligibleReports = reports.filter((r) => r.status === "ELIGIBLE_FOR_DRIVE");

  const handleInputChange = (field: keyof DriveFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReportToggle = (reportId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedReports: prev.linkedReports.includes(reportId) ? [] : [reportId],
    }));
  };

  const handleAddTask = () => {
    if (!currentTask.title.trim() || !currentTask.description.trim()) {
      toast.error("Please fill in task title and description.");
      return;
    }

    if (!formData.linkedReports[0]) {
      toast.error("Please select a report first.");
      return;
    }

    const reportId = formData.linkedReports[0];
    setFormData((prev) => ({
      ...prev,
      taskBreakdown: [...prev.taskBreakdown, { ...currentTask, reportId }],
    }));

    setCurrentTask({
      title: "",
      description: "",
      comfortLevel: EngagementLevel.GROUP,
      reportId: "",
    });
  };

  const handleRemoveTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      taskBreakdown: prev.taskBreakdown.filter((_, i) => i !== index),
    }));
  };

  const getComfortLevelColor = (level: EngagementLevel) => {
    switch (level) {
      case EngagementLevel.INDIVIDUAL:
        return "bg-blue-100 text-blue-800";
      case EngagementLevel.PAIR:
        return "bg-yellow-100 text-yellow-800";
      case EngagementLevel.GROUP:
        return "bg-green-100 text-green-800";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.startDate) {
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
        startDate: formData.startDate,
        linkedReports: formData.linkedReports,
        tasks: formData.taskBreakdown.map((task) => ({
          title: task.title,
          description: task.description,
          comfort: task.comfortLevel,
          reportId: task.reportId,
        })),
      };

      const response = await fetch(isEdit ? `/api/drives/${editId}` : "/api/drives", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData: { error?: string } = await response.json();
        throw new Error(errData.error || "Failed to submit drive");
      }

      if (!isEdit) {
        const createdDrive: Drive & { reports: DriveReport[]; tasks: Task[] } = await response.json();
        const driveToStore: ProposeDriveInput = {
          title: createdDrive.title,
          description: createdDrive.description ?? "",
          startDate: new Date(createdDrive.startDate),
          linkedReports: createdDrive.reports.map((r) => r.reportId),
          status: "PLANNED",
          taskBreakdown: createdDrive.tasks.map((task) => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description ?? "",
            comfort: task.engagement,
            reportId: createdDrive.reports[0]?.reportId ?? "",
            completed: false,
          })),
        };
        proposeDrive(driveToStore);
      }

      toast.success(`Drive ${isEdit ? "updated" : "created"} successfully!`);
      router.push("/drives");
    } catch (err) {
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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto forest-gradient rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{isEdit ? "Edit Drive" : "Propose Community Drive"}</h1>
            <p className="text-muted-foreground">
              Organize community action to address environmental issues
            </p>
          </div>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Drive Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Drive Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Community Cleanup Drive"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Linked Report</Label>
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

              <div className="space-y-4">
                <Label>Task Breakdown ({formData.taskBreakdown.length} tasks)</Label>

                <Card className="bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="taskTitle" className="text-xs font-medium">Task Title</Label>
                          <Input
                            id="taskTitle"
                            placeholder="e.g., Waste Collection"
                            value={currentTask.title}
                            onChange={(e) => setCurrentTask((prev) => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="taskComfort" className="text-xs font-medium">Comfort Level</Label>
                          <Select
                            value={currentTask.comfortLevel}
                            onValueChange={(value: EngagementLevel) =>
                              setCurrentTask((prev) => ({ ...prev, comfortLevel: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EngagementLevel.INDIVIDUAL}>Solo Work</SelectItem>
                              <SelectItem value={EngagementLevel.PAIR}>Low Social Interaction</SelectItem>
                              <SelectItem value={EngagementLevel.GROUP}>Group Activity</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="taskDescription" className="text-xs font-medium">Description</Label>
                        <Textarea
                          id="taskDescription"
                          placeholder="Describe this task..."
                          value={currentTask.description}
                          onChange={(e) => setCurrentTask((prev) => ({ ...prev, description: e.target.value }))}
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

                {formData.taskBreakdown.length > 0 && (
                  <div className="space-y-2">
                    {formData.taskBreakdown.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{task.title}</span>
                            <Badge className={getComfortLevelColor(task.comfortLevel)}>{task.comfortLevel}</Badge>
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

              <div className="pt-4">
                <Button type="submit" className="w-full forest-gradient text-white" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEdit ? "Updating Drive..." : "Creating Drive..."}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-4 w-4 mr-2" />
                      {isEdit ? "Update Drive" : "Create Drive"}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
