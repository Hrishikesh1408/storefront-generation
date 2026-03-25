"use client";

import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";
import Button from "@/src/components/ui/Button/ButtonComponent";
import { useRouter } from "next/navigation";

/**
 * The main landing page component for the application.
 * Contains the branding header and a sign-in button.
 *
 * @returns {JSX.Element} The rendered landing page.
 */
function page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="h-20 flex items-center px-20">
        <Image src={logo} alt="Turbify Logo" className="w-32 h-auto" priority />
        <Button
          onClick={() => router.push("/user/signin")}
          className="w-32 h-12 ml-auto bg-[#0039A7] 
                      text-white px-4 py-2 rounded-lg 
                      float-right hover:bg-blue-600 transition-colors duration-300"
        >
          Sign In
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div>Welcome to Turbify Storefront</div>
      </main>
    </div>
  );
}

export default page;
