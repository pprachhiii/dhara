"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

type AuthFormProps = {
  type: "login" | "register";
};

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === "register") {
        // call your API to create user
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Registration failed");
        }
      }

      // Sign in with credentials
      await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/",
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">{type === "login" ? "Login" : "Register"}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Processing..." : type === "login" ? "Login" : "Register"}
        </button>
      </form>
      <hr className="my-4" />
      <button
        onClick={handleGoogle}
        className="bg-red-500 text-white py-2 rounded hover:bg-red-600 w-full"
      >
        {type === "login" ? "Login with Google" : "Register with Google"}
      </button>
    </div>
  );
}
