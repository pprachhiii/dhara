"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileText, Send } from "lucide-react";
import toast from "react-hot-toast";

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: NominatimAddress;
}

interface ReportFormData {
  title: string;
  description: string;
  city: string;
  region: string;
  country: string;
  pinCode: string;
  media: string[];
}

interface ReportFormProps {
  reportId?: string;
}

export default function ReportForm({ reportId }: ReportFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = reportId || searchParams.get("id");
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    description: "",
    city: "",
    region: "",
    country: "",
    pinCode: "",
    media: [],
  });

  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔍 For autocomplete
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);

  // Load report for editing
  useEffect(() => {
    if (!isEdit || !editId) return;
    (async () => {
      try {
        
        const res = await fetch(`/api/reports/${editId}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const report = await res.json();
        setFormData({
          title: report.title || "",
          description: report.description || "",
          city: report.city || "",
          region: report.region || "",
          country: report.country || "",
          pinCode: report.pinCode || "",
          media: report.media || [],
        });
        setCityQuery(report.city || "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load report data");
      }
    })();
  }, [editId, isEdit]);

  const handleChange = <K extends keyof ReportFormData>(
    field: K,
    value: ReportFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔍 Fetch city suggestions
  useEffect(() => {
    if (!cityQuery || cityQuery.length < 2) return;
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
  }, [cityQuery]);

  // ✅ When user selects a city
  const handleCitySelect = (c: NominatimResult) => {
    setFormData({
      ...formData,
      city: c.address.city || c.address.town || c.address.village || "",
      region: c.address.state || "",
      country: c.address.country || "",
      pinCode: "",
    });
    setCityResults([]);
    setCityQuery(c.display_name);
  };

  // ✅ Validate pinCode
  const validatePin = async () => {
    if (!formData.city || !formData.country || !formData.pinCode) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${
          formData.pinCode
        }&country=${encodeURIComponent(
          formData.country
        )}&format=json&addressdetails=1`
      );
      const data: NominatimResult[] = await res.json();
      const valid = data.some(
        (d) =>
          d.address.country === formData.country &&
          (d.address.state === formData.region || !formData.region)
      );
      if (!valid) {
        toast.error("Pin code does not match the selected location!");
        setFormData((prev) => ({ ...prev, pinCode: "" }));
      } else {
        toast.success("Pin code validated ✅");
      }
    } catch {
      toast.error("Could not validate pin code");
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, media: [...prev.media, data.url] }));
      toast.success("Media uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Media upload failed!");
    } finally {
      setUploading(false);
    }
  };


  const handleRemoveMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.city ||
      !formData.country ||
      !formData.pinCode
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/reports/${editId}` : "/api/reports",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include", // ✅ send cookie automatically
        }
      );

      if (!res.ok) throw new Error("Failed to submit report");
      toast.success(
        `Report ${isEdit ? "updated" : "submitted"} successfully!`
      );
      router.push("/reports");
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEdit ? "update" : "submit"} report`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{isEdit ? "Edit Report" : "Submit New Report"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Brief description of the issue..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder="Provide detailed info about the issue..."
              />
            </div>

            {/* City */}
            <div className="space-y-2 relative">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Enter city"
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

            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="region">Region / State</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleChange("region", e.target.value)}
                placeholder="Enter region or state"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Enter country"
              />
            </div>

            {/* Pin Code */}
            <div className="space-y-2">
              <Label htmlFor="pinCode">Pin Code *</Label>
              <Input
                id="pinCode"
                value={formData.pinCode}
                onChange={(e) => handleChange("pinCode", e.target.value)}
                onBlur={validatePin}
                placeholder="Enter pin/postal code"
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>Photos/Videos</Label>
              <input
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("media-upload")?.click()
                }
                className="w-full border-dashed border-2 h-32 flex flex-col items-center justify-center"
                disabled={uploading}
              >
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photos/videos
                </p>
                {uploading && (
                  <p className="text-xs mt-1">Uploading...</p>
                )}
              </Button>

              {formData.media.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.media.map((media, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={media}
                        alt={`Media ${idx + 1}`}
                        width={400}
                        height={200}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full forest-gradient text-white"
                disabled={isSubmitting || uploading}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-4 w-4 mr-2" />
                    {isEdit ? "Update Report" : "Submit Report"}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
