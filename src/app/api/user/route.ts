import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  try {

    const url = email
      ? `${process.env.FASTAPI_URL}/admin/users?email=${encodeURIComponent(email)}`
      : `${process.env.FASTAPI_URL}/admin/users`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );

  }
}