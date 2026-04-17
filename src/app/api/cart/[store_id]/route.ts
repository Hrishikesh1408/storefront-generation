import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request, context: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({}, { status: 401 });

    const response = await fetch(`${process.env.FASTAPI_URL}/cart/${context.params.store_id}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if(!response.ok) return NextResponse.json({}, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: Request, context: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({}, { status: 401 });

    const body = await req.json();

    const response = await fetch(`${process.env.FASTAPI_URL}/cart/${context.params.store_id}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if(!response.ok) return NextResponse.json({}, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
