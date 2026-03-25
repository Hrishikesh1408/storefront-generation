import { NextRequest, NextResponse } from "next/server";

/**
 * Retrieves the currently authenticated merchant's store configuration.
 * Forwards the authorization cookie to the FastAPI backend.
 *
 * @param {NextRequest} req - The incoming request containing session cookies.
 * @returns {NextResponse} The JSON response containing the store details.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.FASTAPI_URL}/store/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("FastAPI error:", text);

      return NextResponse.json(
        { error: "Failed to fetch store" },
        { status: response.status },
      );
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
