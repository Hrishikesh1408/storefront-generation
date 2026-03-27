import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests to publish a merchant store.
 * Forwards the authorization cookie to the FastAPI backend.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} The JSON response containing success message.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${process.env.FASTAPI_URL}/store/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
