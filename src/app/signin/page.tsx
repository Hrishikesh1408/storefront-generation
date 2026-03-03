import Image from "next/image"
import Link from "next/link"
import logo from "@/src/assets/images/newturbifylogo.png"

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
              href="/signup"
              className="flex-1 text-center py-4 text-lg font-semibold text-gray-500 hover:text-black transition"
            >
              Sign Up
            </Link>

            <Link
              href=""
              className="flex-1 text-center py-4 text-lg font-semibold border-b-2 border-black"
            >
              Sign In
            </Link>
          </div>

          {/* Form Area */}
          <div className="p-8">
            <button className="w-full my-4 bg-[#0039A7] text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
              Sign In with Google
            </button>
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}