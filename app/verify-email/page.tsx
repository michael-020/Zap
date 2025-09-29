"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/authStore/useAuthStore";


export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setInputEmail } = useAuthStore()
  const { data: session } = useSession()

  useEffect(() => {
    if(session)
        redirect("/chat")
  }, [session])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
        const res = await axiosInstance.post("/api/auth/inititate-signup", {
            email
        });

        const data = await res.data;

        toast.success(data.msg)

        setOtpSent(true);
    } catch (error) {
        if (error instanceof AxiosError && error.response?.data?.msg) {
            toast.error(error.response.data.msg as string);
        } else {
            toast.error("An unexpected error occurred.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/api/auth/verify-email", {
        email,
        otp
      });
      
      toast.success(res.data.msg);
      setInputEmail(email)
      router.push(`/signup`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
          <p className="text-neutral-400">
            {otpSent ? "Enter the OTP sent to your email" : "Verify your email to continue"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent || isLoading}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition-all duration-200 disabled:bg-neutral-800/50 disabled:cursor-not-allowed placeholder-neutral-500"
            />
          </div>

          {otpSent && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-300 mb-2">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
                required
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition-all duration-200 disabled:bg-neutral-800/50 disabled:cursor-not-allowed placeholder-neutral-500"
              />
            </div>
          )}

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
                {otpSent ? "Verifying..." : "Sending..."}
              </div>
            ) : otpSent ? (
              "Verify OTP"
            ) : (
              "Send OTP"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium hover:underline text-neutral-300 hover:text-white transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        
      </div>
    </div>
  );
}