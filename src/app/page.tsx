"use client";

import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";
import Button from "@/src/components/ui/Button/ButtonComponent";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
          <Button
            onClick={() => router.push("/user/signin")}
            size="sm"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 gradient-hero relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-[var(--primary-600)]/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute top-1/4 left-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-[var(--neutral-300)] mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              AI-Powered Storefront Generation
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Build Your Store
              <br />
              <span className="text-gradient">In Minutes, Not Months</span>
            </h1>

            <p className="text-lg text-[var(--neutral-400)] max-w-xl mx-auto mb-10 leading-relaxed">
              Generate products, customize your storefront, and go live instantly
              with the power of AI. No coding required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => router.push("/user/signin")}
                size="lg"
                className="group"
              >
                Get Started Free
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <Button
                onClick={() => {}}
                variant="ghost"
                size="lg"
                className="text-[var(--neutral-300)] hover:text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 12V22M12 12L2 7M12 12l10-5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                title: "AI Products",
                desc: "Generate product listings with AI-powered descriptions and pricing",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 9h18M9 9v12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                title: "Custom Storefront",
                desc: "Personalize your store with categories, branding, and layouts",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Instant Launch",
                desc: "Publish your store and start selling within minutes",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-md)] border border-white/10 bg-white/5 p-6 backdrop-blur-sm
                           card-hover animate-slide-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
              >
                <div className="text-[var(--primary-400)] mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--neutral-400)] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
