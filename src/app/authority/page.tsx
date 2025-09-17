"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { Authority, ReportAuthority, Report, AuthorityCategory, AuthorityRole } from "@prisma/client";
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
  const [category, setCategory] = useState<AuthorityCategory | "ALL">("ALL");
  const [role, setRole] = useState<AuthorityRole | "ALL">("ALL");

  const fetchAuthorities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category !== "ALL") params.append("category", category);
    if (role !== "ALL") params.append("role", role);

    try {
      const res = await fetch(`/api/authority?${params.toString()}`, { cache: "no-store" });
      const data: Authority[] = await res.json();
      setAuthorities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch authorities");
    } finally {
      setLoading(false);
    }
  }, [search, category, role]);

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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Authorities</h1>
          <p className="text-muted-foreground">
            Manage and track authorities with clear categories and roles.
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md"
          asChild
        >
          <button onClick={() => setCreatingAuthority(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Authority
          </button>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={(val) => setCategory(val as AuthorityCategory | "ALL")}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value={AuthorityCategory.GOVERNMENT}>Government</SelectItem>
            <SelectItem value={AuthorityCategory.NGO}>NGO</SelectItem>
            <SelectItem value={AuthorityCategory.COMMUNITY}>Community</SelectItem>
            <SelectItem value={AuthorityCategory.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={role} onValueChange={(val) => setRole(val as AuthorityRole | "ALL")}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value={AuthorityRole.CLEANUP}>Cleanup</SelectItem>
            <SelectItem value={AuthorityRole.WASTE_MANAGEMENT}>Waste Management</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setCategory("ALL");
            setRole("ALL");
          }}
        >
          Reset
        </Button>
      </div>

      {/* Authority Table */}
      {authorities.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">City</th>
                <th className="text-left px-4 py-2">Region</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Website</th>
              </tr>
            </thead>
            <tbody>
              {authorities.map((auth) => (
                <tr
                  key={auth.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => openAuthority(auth.id)}
                >
                  <td className="px-4 py-2 font-medium">{auth.name}</td>
                  <td className="px-4 py-2">{auth.category}</td>
                  <td className="px-4 py-2">{auth.role}</td>
                  <td className="px-4 py-2">{auth.city}</td>
                  <td className="px-4 py-2">{auth.region ?? "-"}</td>
                  <td className="px-4 py-2">{auth.email ?? "-"}</td>
                  <td className="px-4 py-2">{auth.phone ?? "-"}</td>
                  <td className="px-4 py-2">
                    {auth.website ? (
                      <a
                        href={auth.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No authorities found</h3>
            <p className="text-muted-foreground mb-6">
              {search || category !== "ALL" || role !== "ALL"
                ? "Try adjusting your filters."
                : "Be the first to create an authority!"}
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
              onClick={() => setCreatingAuthority(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Create First Authority
            </Button>
          </div>
        </div>
      ) : (
        <p>Loading authorities...</p>
      )}

      {/* Authority Detail Modal */}
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
            <p className="text-sm text-gray-500 mb-4">
              {selectedAuthority.category} - {selectedAuthority.role}
            </p>
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
                  className="text-green-600 underline"
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
