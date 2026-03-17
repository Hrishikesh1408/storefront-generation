import Image from "next/image"
import Link from "next/link"
import logo from "@/src/assets/images/newturbifylogo.png"
import GoogleLoginButton from "@/src/components/auth/GoogleLoginButton";

export default function Page() {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Header */}
      <header className="h-20 flex items-center px-20">
        <Image
          src={logo}
          alt="Turbify Logo"
          className="w-32 h-auto"
          priority
        />
      </header>

      {/* Auth Container */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border-gray">

          {/* Tabs */}
          <div className="flex border-b">
            <div
              
              className="flex-1 text-center py-4 text-lg font-semibold"
            >
              Sign In
            </div>
          </div>

          {/* Form Area */}
          <div className="p-8">
            <GoogleLoginButton />
          </div>

        </div>
      </main>

    </div>
  )
}