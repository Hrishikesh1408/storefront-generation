import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("http://127.0.0.1:8000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    // handle backend errors
    if (!response.ok) {
      const text = await response.text();
      console.error("FastAPI error:", text);

      return NextResponse.json(
        { error: "Backend authentication failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const res = NextResponse.json({
      user: data.user,
      role: data.role
    });

    res.cookies.set("token", data.token, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return res;

  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}