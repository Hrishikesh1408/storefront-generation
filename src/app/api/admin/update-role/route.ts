import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { message: "Missing userId or role" },
        { status: 400 }
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
      }
    );

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}