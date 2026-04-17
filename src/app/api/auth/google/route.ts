import { NextResponse } from "next/server";

/**
 * Handles Google OAuth login POST requests.
 * Proxies the token to the FastAPI backend, and sets cookies
 * containing the session JWT and role for subsequent requests.
 *
 * @param {Request} req - The incoming request containing the Google token.
 * @returns {NextResponse} The JSON response containing user details or an error.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${process.env.FASTAPI_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // handle backend errors
    if (!response.ok) {
      const text = await response.text();
      console.error("FastAPI error:", text);

      return NextResponse.json(
        { error: "Backend authentication failed" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const res = NextResponse.json({
      user: data.user,
      role: data.user.role,
    });

    res.cookies.set("token", data.token, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("role", data.user.role, {
      httpOnly: false, // frontend needs access
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
