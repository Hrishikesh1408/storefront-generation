import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests to create a new merchant store.
 * Forwards the authorization cookie to the FastAPI backend.
 *
 * @param {NextRequest} req - The incoming request containing store details.
 * @returns {NextResponse} The JSON response containing the created store.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.FASTAPI_URL}/store/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("FastAPI error:", text);

      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
