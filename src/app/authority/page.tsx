"use client";

import { useEffect, useState } from "react";
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

interface Authority {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchAuthorities = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (city) params.append("city", city);
      if (region) params.append("region", region);
      if (type) params.append("type", type);

      const url = `/api/authority?${params.toString()}`;

      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.warn("API did not return an array!", data);
        }

        setAuthorities(data);
      } catch (err) {
        console.error("Error fetching authorities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorities();
  }, [search, city, region, type]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">All Authorities</h1>

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
            <SelectItem value="GOVERNMENT">Government</SelectItem>
            <SelectItem value="NGO">NGO</SelectItem>
            <SelectItem value="OTHERS">Others</SelectItem>
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

      {/* Results */}
      {loading ? (
        <p>Loading authorities...</p>
      ) : authorities.length === 0 ? (
        <p>No authorities found.</p>
      ) : (
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
                <TableRow key={auth.id}>
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
    </div>
  );
}
