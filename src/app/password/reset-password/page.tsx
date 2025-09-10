"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token");
      setIsTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTokenValid) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "reset", token, password }),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (!res.ok) {
        const errorMessage = typeof data.error === "string" ? data.error : "Something went wrong";
        toast.error(errorMessage);

        if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("expired")) {
          setIsTokenValid(false);
        }
      } else {
        toast.success(data.message || "Password reset successfully");
        router.push("/api/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow rounded-xl space-y-4"
    >
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <Input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={!isTokenValid || loading}
      />
      <Button type="submit" disabled={!isTokenValid || loading} className="w-full">
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
