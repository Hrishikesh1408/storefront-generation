import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";
import GoogleLoginButton from "@/src/components/auth/GoogleLoginButton";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--primary-600)]/15 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center justify-center w-full px-12">
          <Image src={logo} alt="Turbify" className="w-36 h-auto mb-8" priority />
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Welcome to Turbify
          </h2>
          <p className="text-[var(--neutral-400)] text-center max-w-sm leading-relaxed">
            Build your AI-powered storefront and start selling in minutes. 
            Sign in to manage your products and grow your business.
          </p>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col bg-[var(--bg-body)]">
        {/* Mobile logo */}
        <div className="lg:hidden px-6 py-4">
          <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm animate-slide-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Sign in to your account
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Continue with your Google account to get started
              </p>
            </div>

            <div className="bg-white rounded-[var(--radius-md)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] p-8">
              <div className="flex justify-center">
                <GoogleLoginButton />
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center mt-6 leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
