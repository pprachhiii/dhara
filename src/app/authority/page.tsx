"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Authority, AuthorityType, ReportAuthority, Report } from "@/lib/types";
import toast from "react-hot-toast";
import CreateForm from "@/components/CreateForm";

type AuthorityDetail = Authority & {
  reportAuthorities?: (ReportAuthority & { report?: Report })[];
};

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityDetail | null>(null);
  const [creatingAuthority, setCreatingAuthority] = useState(false);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");

  const fetchAuthorities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (city) params.append("city", city);
    if (region) params.append("region", region);
    if (type) params.append("type", type);

    try {
      const res = await fetch(`/api/authority?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setAuthorities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch authorities");
    } finally {
      setLoading(false);
    }
  }, [search, city, region, type]);

  useEffect(() => {
    fetchAuthorities();
  }, [fetchAuthorities]);

  const openAuthority = async (id: string) => {
    try {
      const res = await fetch(`/api/authority/${id}`);
      if (!res.ok) throw new Error("Authority not found");
      const data: AuthorityDetail = await res.json();
      setSelectedAuthority(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load authority details");
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-6 relative">
      {/* Loading State */}
      {loading ? (
        <p>Loading authorities...</p>
      ) : authorities.length === 0 ? (
        <p>No authorities found.</p>
      ) : null}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Authorities</h1>
        <Button onClick={() => setCreatingAuthority(true)}>Create Authority</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Input
          placeholder="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-40"
        />
        <Input
          placeholder="Filter by region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-40"
        />
        <Select value={type} onValueChange={(val) => setType(val)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AuthorityType.GOVERNMENT}>Government</SelectItem>
            <SelectItem value={AuthorityType.NGO}>NGO</SelectItem>
            <SelectItem value={AuthorityType.OTHERS}>Others</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setCity("");
            setRegion("");
            setType("");
          }}
        >
          Reset
        </Button>
      </div>

      {/* Authorities Table */}
      {authorities.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorities.map((auth) => (
                <TableRow
                  key={auth.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => openAuthority(auth.id)}
                >
                  <TableCell className="font-medium">{auth.name}</TableCell>
                  <TableCell>{auth.type}</TableCell>
                  <TableCell>{auth.city}</TableCell>
                  <TableCell>{auth.region ?? "-"}</TableCell>
                  <TableCell>{auth.email ?? "-"}</TableCell>
                  <TableCell>{auth.phone ?? "-"}</TableCell>
                  <TableCell>
                    {auth.website ? (
                      <a
                        href={auth.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Authority Details Modal */}
      {selectedAuthority && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setSelectedAuthority(null)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedAuthority.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedAuthority.type}</p>
            <p className="mb-1"><strong>City:</strong> {selectedAuthority.city}</p>
            <p className="mb-1"><strong>Region:</strong> {selectedAuthority.region ?? "-"}</p>
            <p className="mb-1"><strong>Email:</strong> {selectedAuthority.email ?? "-"}</p>
            <p className="mb-1"><strong>Phone:</strong> {selectedAuthority.phone ?? "-"}</p>
            <p className="mb-4">
              <strong>Website:</strong>{" "}
              {selectedAuthority.website ? (
                <a
                  href={selectedAuthority.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Visit
                </a>
              ) : (
                "-"
              )}
            </p>

            {selectedAuthority.reportAuthorities?.length ? (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Related Reports</h3>
                <ul className="list-disc list-inside text-sm">
                  {selectedAuthority.reportAuthorities
                    .filter((ra): ra is ReportAuthority & { report: Report } => !!ra.report)
                    .map((ra) => (
                      <li key={ra.id}>
                        {ra.report.title} - Status: {ra.report.status}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Create Authority Modal */}
      {creatingAuthority && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setCreatingAuthority(false)}
            >
              ✕
            </button>

            <CreateForm
              model="Authority"
              onClose={() => setCreatingAuthority(false)}
              onSuccess={async () => {
                setCreatingAuthority(false);
                await fetchAuthorities();
                toast.success("Authority created successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
