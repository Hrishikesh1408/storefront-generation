import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const body = await req.json();

  const response = await fetch("http://127.0.0.1:8000/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  const res = NextResponse.json({ user: data.user });

  res.cookies.set("token", data.token, {
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}