import { cookies } from "next/headers";
import { getAdminAuth } from "./firebaseAdmin";

export interface DecodedToken {
  uid: string;
  email?: string;
}

export async function requireAuth(request: Request): Promise<DecodedToken> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or malformed Authorization header");
  }

  const token = authHeader.substring(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    
    const allowedEmail = process.env.STUDIO_ALLOWED_EMAIL;
    if (!allowedEmail || decoded.email !== allowedEmail) {
      throw new Error("Unauthorized: Email not allowed inside admin panel");
    }
    
    return decoded;
  } catch (error: any) {
    throw new Error(`Unauthorized: ${error.message}`);
  }
}

export async function requireSessionAuth(): Promise<DecodedToken> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("studio_session")?.value;
  if (!sessionCookie) {
    throw new Error("Unauthorized: Missing session cookie");
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    
    const allowedEmail = process.env.STUDIO_ALLOWED_EMAIL;
    if (!allowedEmail || decoded.email !== allowedEmail) {
      throw new Error("Unauthorized: Email not allowed inside admin panel");
    }
    
    return decoded as unknown as DecodedToken;
  } catch (error: any) {
    throw new Error(`Unauthorized: ${error.message}`);
  }
}
