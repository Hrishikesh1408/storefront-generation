import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const productId = params.id;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${process.env.FASTAPI_URL}/store/deselect-product/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to deselect product" },
      { status: 500 }
    );
  }
}
