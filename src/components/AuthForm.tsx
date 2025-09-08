"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

type AuthFormProps = {
  mode: "login" | "register";
};

type FormData = {
  name?: string;
  email: string;
  password: string;
};

type AuthResponse = {
  token?: string;
  error?: string;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result: AuthResponse = {};
      try {
        result = await res.json();
      } catch {
        result = {};
      }

      if (!res.ok) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      if (mode === "register") {
        toast.success("Registered successfully! Please login.");
        router.push("/auth/login");
      } else {
        if (result.token) {
          localStorage.setItem("token", result.token);
        }
        toast.success("Login successful!");
        router.push("/"); // redirect to home
      }
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-lg max-w-xl w-full mx-auto mt-12 min-h-[28rem] flex flex-col justify-center"
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        {mode === "login" ? "Login to DHARA" : "Create your DHARA Account"}
      </h1>

      {mode === "register" && (
        <div className="space-y-1">
          <Input
            type="text"
            placeholder="Full Name"
            {...register("name")}
            disabled={loading}
            className="p-3 text-lg"
          />
        </div>
      )}

      <div className="space-y-1">
        <Input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
          disabled={loading}
          className="p-3 text-lg"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
          disabled={loading}
          className="p-3 text-lg"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        {/* Forgot password link for login mode */}
        {mode === "login" && (
          <p className="text-right mt-1">
            <Link href="/password/forget-password" className="text-blue-600 hover:underline text-sm">
              Forgot Password?
            </Link>
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-lg rounded-xl"
      >
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
      </Button>

      {/* Link to switch between login/register */}
      <p className="text-center mt-4 text-gray-600">
        {mode === "login" ? (
          <>
            Don&#39;t have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
