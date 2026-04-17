import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const params = await context.params;
    const value = params.value;
    
    const response = await fetch(`${process.env.FASTAPI_URL}/products/by-category/${value}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products for category" },
      { status: 500 }
    );
  }
}
