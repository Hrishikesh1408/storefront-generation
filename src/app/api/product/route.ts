import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get("store_id");

    if (!store_id) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.FASTAPI_URL}/products/${store_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
