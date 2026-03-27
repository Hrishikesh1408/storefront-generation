"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/src/assets/images/newturbifylogo.png";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Shared Header */}
      <header className="h-20 flex items-center justify-between px-10 border-b bg-white shadow-sm z-10 relative">
        <Image src={logo} alt="Logo" className="w-32 h-auto" priority />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r shadow-sm overflow-y-auto">
          <nav className="p-4 space-y-2">
            <Link 
              href="/merchant/dashboard"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/merchant/dashboard" 
                  ? "bg-blue-50 text-blue-700 font-semibold" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/merchant/products"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/merchant/products" 
                  ? "bg-blue-50 text-blue-700 font-semibold" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Products
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
