import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Simple password verification
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return false;
  }
  return password === adminPassword;
}

// Create a session token
export function createSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Set session cookie
export async function setAdminSession(): Promise<string> {
  const token = createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // maxAge is in seconds
    path: '/',
  });

  return token;
}

// Clear session cookie
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  return !!sessionCookie?.value;
}

// Get session from request headers (for API routes)
export function getSessionFromHeaders(headers: Headers): string | null {
  const cookieHeader = headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${ADMIN_COOKIE_NAME}=`));

  if (!sessionCookie) return null;
  return sessionCookie.split('=')[1];
}

// Verify authentication from request (for API routes)
export function verifyAuthFromRequest(request: Request): boolean {
  const session = getSessionFromHeaders(request.headers);
  return !!session;
}
