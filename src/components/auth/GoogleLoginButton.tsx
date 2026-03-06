"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton() {

  const handleSuccess = async (credentialResponse: any) => {

    const token = credentialResponse.credential;

    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}