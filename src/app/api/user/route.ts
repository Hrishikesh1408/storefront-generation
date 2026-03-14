import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  try {

    const response = await fetch(
      `http://localhost:8000/admin/users/${encodeURIComponent(email)}`
    );

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );

  }

}