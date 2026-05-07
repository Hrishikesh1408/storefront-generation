import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const params = await context.params;
    const store_id = params.store_id;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/store/${store_id}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products for store" },
      { status: 500 }
    );
  }
}
