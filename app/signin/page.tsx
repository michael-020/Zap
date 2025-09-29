"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { getAuthErrorMessage } from "@/utils/authErrors";
import toast from "react-hot-toast";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const { data: session } = useSession();

  useEffect(() => {
    if(session) {
      redirect("/chat");
    }

    const error = searchParams.get("error");
    if (error) {
      toast.error(getAuthErrorMessage(error));
    }
  }, [session]);
 
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const decodedCallbackUrl = decodeURIComponent(callbackUrl);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: decodedCallbackUrl
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
        toast.error(getAuthErrorMessage(result.error));
      } else if (result?.ok) {
        router.push(decodedCallbackUrl);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="bg-neutral-900 text-neutral-100 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Welcome Back</h1>
          <p className="text-neutral-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition-all duration-200 disabled:bg-neutral-800/50 disabled:cursor-not-allowed placeholder-neutral-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-200 mb-2">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-900 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: decodedCallbackUrl })}
            disabled={isLoading}
            className="mt-6 w-full bg-neutral-700 hover:bg-neutral-800 text-white font-medium py-3 px-4 border border-neutral-900 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Image alt="google-image" src={"./google.svg"} width={25} height={25} />
            <p>
              Continue with Google
            </p>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/verify-email" className="font-medium hover:underline text-neutral-200 hover:text-white transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}