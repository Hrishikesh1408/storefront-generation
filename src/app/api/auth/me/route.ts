import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";

/**
 * Returns the current user's profile info by decoding the JWT
 * stored in the httpOnly cookie. No backend call needed.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    return NextResponse.json({
      user: {
        id: payload.user_id,
        email: payload.email,
        name: payload.name || "",
        picture: payload.picture || "",
        role: payload.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
