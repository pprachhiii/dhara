"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Edit, X } from "lucide-react";
import toast from "react-hot-toast";
import { Drive, DriveStatus, DriveReport } from "@/lib/types";

type DriveDetailPageProps = {
  drive: Drive;
  onClose: () => void;
};

export function DriveDetailPage({ drive, onClose }: DriveDetailPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DriveStatus>(drive.status);
  const [updating, setUpdating] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this drive?")) return;

    try {
      const res = await fetch(`/api/drives/${drive.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete drive");
      toast.success("Drive deleted successfully!");
      onClose();
      router.push("/drives");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete drive");
    }
  };

  const handleUpdateStatus = async (newStatus: DriveStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/drives/${drive.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      setStatus(newStatus);
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30 backdrop-blur-sm">
      <Card className="w-full max-w-4xl p-6 rounded-2xl shadow-elevated relative space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <CardHeader>
          <CardTitle className="text-2xl font-bold">{drive.title}</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-muted-foreground">Status:</span>
            <select
              value={status}
              onChange={(e) => handleUpdateStatus(e.target.value as DriveStatus)}
              disabled={updating}
              className="border border-border rounded px-2 py-1 text-sm"
            >
              <option value="PLANNED">PLANNED</option>
              <option value="VOTING_FINALIZED">VOTING_FINALIZED</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {drive.description && <p className="text-foreground">{drive.description}</p>}

          {/* Dates */}
          <div className="text-sm text-muted-foreground">
            Start Date: {new Date(drive.startDate).toLocaleString()}
            {drive.endDate && ` | End Date: ${new Date(drive.endDate).toLocaleString()}`}
          </div>

          {/* Participant Count */}
          <div className="text-sm text-muted-foreground">
            Participants: {drive.participant}
          </div>

          {/* Associated Reports */}
          {drive.reports && drive.reports.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Associated Reports:</h3>
              <ul className="space-y-1">
                {drive.reports.map((report: DriveReport) => (
                  <li key={report.id} className="text-sm text-foreground">
                    {report.report.title} - {report.report.description ?? "No description"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/drives/edit?id=${drive.id}`)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Created: {new Date(drive.createdAt).toLocaleString()} | Last Updated:{" "}
            {new Date(drive.updatedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
