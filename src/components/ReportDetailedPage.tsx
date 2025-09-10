"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Edit, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Report, ReportStatus } from "@/lib/types";

type ReportDetailPageProps = {
  report: Report;
  onClose: () => void;
};

export function ReportDetailPage({ report, onClose }: ReportDetailPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [updating, setUpdating] = useState(false);

  // DELETE REPORT
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Report deleted successfully!");
      onClose();
      router.push("/reports");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete report");
    }
  };

  // UPDATE STATUS
  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
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
      <Card className="w-full max-w-3xl p-6 rounded-2xl shadow-elevated relative space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <CardHeader>
          <CardTitle className="text-2xl font-bold">{report.title}</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-muted-foreground">Status:</span>
            <select
              value={status}
              onChange={(e) => handleUpdateStatus(e.target.value as ReportStatus)}
              disabled={updating}
              className="border border-border rounded px-2 py-1 text-sm"
            >
              <option value="PENDING">PENDING</option>
              <option value="AUTHORITY_CONTACTED">AUTHORITY_CONTACTED</option>
              <option value="ELIGIBLE_DRIVE">ELIGIBLE_DRIVE</option>
              <option value="VOTING_FINALIZED">VOTING_FINALIZED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Reporter Info */}
          <div className="text-sm text-muted-foreground">
            Reported by: {report.reporter.name || report.reporter.email}
          </div>

          {/* Location */}
          {report.city && (
            <div className="text-sm text-muted-foreground">
              Location: {report.city}, {report.region}, {report.country} ({report.pinCode})
            </div>
          )}
          {report.latitude && report.longitude && (
            <div className="text-sm text-muted-foreground">
              Coordinates: {report.latitude}, {report.longitude}
            </div>
          )}

          {/* Description */}
          <p className="text-foreground">{report.description}</p>

          {/* Media */}
          {(report.media?.length ?? 0) > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {report.media?.map((url, index) => (
                <div key={index} className="relative w-full h-40 rounded-lg overflow-hidden shadow-gentle">
                  <Image src={url} alt={`Media ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/reports/new?id=${report.id}`)}
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
            Created: {new Date(report.createdAt).toLocaleString()} | Last Updated:{" "}
            {new Date(report.updatedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
