import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;

    const response = await fetch(`${process.env.FASTAPI_URL}/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
