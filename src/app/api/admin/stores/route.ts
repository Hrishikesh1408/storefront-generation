import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  try {
    const url = name
      ? `${process.env.FASTAPI_URL}/admin/stores?name=${encodeURIComponent(name)}`
      : `${process.env.FASTAPI_URL}/admin/stores`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
