import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("Authorization");

    const response = await fetch(`${process.env.FASTAPI_URL}/store/select-products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to select products" },
      { status: 500 }
    );
  }
}
