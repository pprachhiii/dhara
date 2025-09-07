import { authOptions } from "../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, email, password, token } = body;

    // ----------------- SET PASSWORD -----------------
    if (mode === "set") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 400 });
      }

      // Hash and save the password
      const hashed = await hash(password, 12);
      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashed },
      });

      // ✅ Because JWT callback checks for `!user.password`, this automatically clears `needsPassword`
      return NextResponse.json({ message: "Password set successfully" });
    }

    // ----------------- FORGOT PASSWORD -----------------
    if (mode === "forgot") {
      if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "No user found with this email" }, { status: 404 });

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        from: `"Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `<p>You requested a password reset. Click below to reset your password:</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>This link will expire in 1 hour.</p>`,
      });

      return NextResponse.json({ message: "Password reset email sent" });
    }

    // ----------------- RESET PASSWORD -----------------
    if (mode === "reset") {
      if (!token || !password) {
        return NextResponse.json({ error: "Token and new password required" }, { status: 400 });
      }

      const user = await prisma.user.findFirst({ where: { resetToken: token } });
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
      }

      const hashed = await hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, resetToken: null, resetTokenExpiry: null },
      });

      return NextResponse.json({ message: "Password reset successfully" });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err: unknown) {
    let message = "Server error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
