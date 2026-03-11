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
        <div className="w-full max-w-md bg-white rounded-xl shadow-md">

          {/* Tabs */}
          <div className="flex border-b">
            <Link
              href="./signin"
              className="flex-1 text-center py-4 text-lg font-semibold border-b-2 border-black"
            >
              Admin
            </Link>

            <Link
              href="/merchant/signin"
              className="flex-1 text-center py-4 text-lg font-semibold text-gray-500 hover:text-black transition"
            >
              Merchant
            </Link>

            <Link
              href="user/signin"
              className="flex-1 text-center py-4 text-lg font-semibold text-gray-500 hover:text-black transition"
            >
              User
            </Link>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <Link
              href="./signup"
              className="flex-1 text-center py-4 text-lg font-semibold text-gray-500 hover:text-black transition"
            >
              Sign Up
            </Link>

            <Link
              href="./signin"
              className="flex-1 text-center py-4 text-lg font-semibold border-b-2 border-black"
            >
              Sign In
            </Link>
          </div>

          {/* Form Area */}
          <div className="p-8">
            <GoogleLoginButton role="admin"/>
            <p className="text-sm text-gray-600 text-center mt-4">
              Don't have an account?{" "}
              <Link href="./signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}