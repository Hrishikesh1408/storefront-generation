import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const user_id = params.user_id;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.FASTAPI_URL}/admin/store/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch store" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
