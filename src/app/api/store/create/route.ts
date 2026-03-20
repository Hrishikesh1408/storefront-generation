import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ get token from cookies
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.FASTAPI_URL}/store/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    // 🔴 handle backend errors
    if (!response.ok) {
      const text = await response.text();
      console.error("FastAPI error:", text);

      return NextResponse.json(
    { error: text },   // 👈 show actual backend error
    { status: response.status }
  );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}