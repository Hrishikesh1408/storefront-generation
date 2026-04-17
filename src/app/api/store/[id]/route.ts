import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const id = params.id;
    const response = await fetch(`${process.env.FASTAPI_URL}/store/${id}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}