import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type PageUser = {
  id: string;
  email: string;
  name: string;
} | null;

export async function getUserFromPage(): Promise<PageUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & {
      sub: string;
      email: string;
      name: string;
    };

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
