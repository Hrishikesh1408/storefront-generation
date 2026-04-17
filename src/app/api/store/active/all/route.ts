import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${process.env.FASTAPI_URL}/store/active/all`, {
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch active stores" },
      { status: 500 }
    );
  }
}
