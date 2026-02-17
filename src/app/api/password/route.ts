import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetEmail } from '@/lib/email';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password: string) => {
  return await hash(password, 12);
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export async function POST(req: NextRequest) {
  try {
    const { mode, email, password, token } = await req.json();

    // ----------------- FORGOT PASSWORD -----------------
    if (mode === 'forgot') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user)
        return NextResponse.json({ error: 'No user found with this email' }, { status: 404 });

      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); //1 hour

      await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      await sendResetEmail(email, resetUrl);

      return NextResponse.json({ message: 'Password reset email sent' });
    }

    // ----------------- RESET PASSWORD -----------------
    if (mode === 'reset') {
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        where: { resetToken: token },
      });
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      const hashed = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, resetToken: null, resetTokenExpiry: null },
      });

      return NextResponse.json({ message: 'Password reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    let message = 'Server error';
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
