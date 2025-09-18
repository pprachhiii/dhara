"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; 

type AuthFormProps = {
  mode: "login" | "register";
};

type FormData = {
  name?: string;
  email: string;
  password: string;
};

type AuthResponse = {
  error?: string;
  message?: string;
  user?: { id: string; email: string; name?: string };
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- New state

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
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
        toast.success("Account created! You are now logged in.");
        router.push("/");
      } else {
        toast.success("Login successful!");
        router.push("/");
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
      className="space-y-6 bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-auto -mt-8 min-h-[28rem] flex flex-col justify-center"
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        {mode === "login" ? "Login to DHARA" : "Register"}
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

      <div className="space-y-1 relative">
        <Input
          type={showPassword ? "text" : "password"} // <-- toggle password type
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
          disabled={loading}
          className="p-3 text-lg pr-10" // padding-right for icon
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 inset-y-0 flex items-center text-gray-500"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        {mode === "login" && (
          <p className="text-right mt-1">
            <Link
              href="/password/forget-password"
              className="text-green-600 hover:underline text-sm"
            >
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

      <p className="text-center mt-4 text-gray-600">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-green-600 hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-green-600 hover:underline">
              Login
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
