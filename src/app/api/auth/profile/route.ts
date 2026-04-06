import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Proxies profile update requests to the FastAPI backend.
 * Sends the JWT from the httpOnly cookie as a Bearer token,
 * and updates the cookie with the fresh JWT returned by the backend.
 */
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(`${process.env.FASTAPI_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Profile update error:", text);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Update the JWT cookie with the fresh token containing new claims
    const res = NextResponse.json({ user: data.user });

    res.cookies.set("token", data.token, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Profile update route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
