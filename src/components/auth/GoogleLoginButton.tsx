"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

type GoogleLoginButtonProps = {
  role: "admin" | "merchant" | "user";
};

export default function GoogleLoginButton({ role }: GoogleLoginButtonProps) {

  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {

    const token = credentialResponse.credential;

    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, role })
    });

    const data = await res.json();
    console.log(data);

    router.push(`/${data.role}/dashboard`);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}