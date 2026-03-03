'use client';

import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";
import { useRouter } from 'next/navigation';

function page() {
    const router = useRouter();

    return ( 
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="h-20 flex items-center px-20">
            <Image
              src={logo}
              alt="Turbify Logo"
              className="w-32 h-auto"
              priority
            />
            <button onClick={() => router.push('/signin')} 
                    className="w-32 h-12 ml-auto bg-[#0039A7] 
                      text-white px-4 py-2 rounded-lg 
                      float-right hover:bg-blue-600 transition-colors duration-300"
                    >
                      Sign In
            </button>
          </header>
          <main className="flex flex-1 items-center justify-center px-6">
            <div>
              Welcome to Turbify Storefront
            </div>
          </main>
        </div>
     );
}


export default page;