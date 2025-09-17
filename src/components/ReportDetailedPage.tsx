"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Edit, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [updating, setUpdating] = useState<boolean>(false);

  // Carousel state
  const mediaItems: string[] = report.media ?? [];
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Auto-cycle every 5s
  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mediaItems.length]);

  // DELETE REPORT
  const handleDelete = async (): Promise<void> => {
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
  const handleUpdateStatus = async (newStatus: ReportStatus): Promise<void> => {
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30 backdrop-blur-sm overflow-y-auto"
      onClick={onClose} // click on backdrop closes modal
    >
      <div
        className="w-full max-w-3xl my-8"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside card
      >
        <Card className="p-6 rounded-2xl shadow-elevated relative space-y-6">
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
            {/* Media Carousel */}
            {mediaItems.length > 0 && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-gentle">
                {mediaItems[currentIndex].match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={mediaItems[currentIndex]}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <Image
                    src={mediaItems[currentIndex]}
                    alt={`Media ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                )}

                {/* Prev Button */}
                {mediaItems.length > 1 && (
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    onClick={() =>
                      setCurrentIndex(
                        (prev) => (prev - 1 + mediaItems.length) % mediaItems.length
                      )
                    }
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Next Button */}
                {mediaItems.length > 1 && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    onClick={() =>
                      setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
                    }
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                {/* Dots */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                    {mediaItems.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          idx === currentIndex ? "bg-white" : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-muted-foreground">Status:</span>
              <select
                value={status}
                onChange={(e) =>
                  handleUpdateStatus(e.target.value as ReportStatus)
                }
                disabled={updating}
                className="border border-border rounded px-2 py-1 text-sm"
              >
                <option value="PENDING">PENDING</option>
                <option value="AUTHORITY_CONTACTED">AUTHORITY_CONTACTED</option>
                <option value="RESOLVED_BY_AUTHORITY">RESOLVED_BY_AUTHORITY</option>
                <option value="ELIGIBLE_FOR_VOTE">ELIGIBLE_FOR_VOTE</option>
                <option value="VOTING_FINALIZED">VOTING_FINALIZED</option>
                <option value="ELIGIBLE_FOR_DRIVE">ELIGIBLE_FOR_DRIVE</option>
                <option value="DRIVE_FINALIZED">DRIVE_FINALIZED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="UNDER_MONITORING">UNDER_MONITORING</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            {/* Reporter Info */}
            <div className="text-sm text-muted-foreground">
              Reported by: {report.reporter.name || report.reporter.email}
            </div>

            {/* Location */}
            {report.city && (
              <div className="text-sm text-muted-foreground">
                Location: {report.city}, {report.region}, {report.country} (
                {report.pinCode})
              </div>
            )}
            {report.latitude && report.longitude && (
              <div className="text-sm text-muted-foreground">
                Coordinates: {report.latitude}, {report.longitude}
              </div>
            )}

            {/* Description */}
            <p className="text-foreground">{report.description}</p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/reports/new?id=${report.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>

              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              Created: {new Date(report.createdAt).toLocaleString()} | Last
              Updated: {new Date(report.updatedAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
