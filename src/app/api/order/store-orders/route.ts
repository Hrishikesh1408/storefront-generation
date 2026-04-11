import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(`${process.env.FASTAPI_URL}/order/store-orders`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
