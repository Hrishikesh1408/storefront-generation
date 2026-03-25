import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests to update a user's role.
 * Proxies the request to the FastAPI backend at /admin/update-role.
 *
 * @param {NextRequest} req - The incoming request containing userId and role in the body.
 * @returns {NextResponse} The JSON response containing the update status.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { message: "Missing userId or role" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(
      `${process.env.FASTAPI_URL}/admin/update-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          role: role,
        }),
      },
    );

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
