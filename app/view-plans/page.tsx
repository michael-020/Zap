"use client"

import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ViewPlansPage = () => {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro')

  const handleSubscribe = async (plan: 'free' | 'pro') => {
    if (plan === 'free') {
      router.push('/chat')
      return
    }

    router.push('/payment-page')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-neutral-400 text-lg">
            Build stunning websites with AI-powered generation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 ">
          {/* Free Plan */}
          <div 
            className={`p-8 rounded-2xl border-2 ${
              selectedPlan === 'free' 
                ? 'border-blue-500 bg-neutral-900/90 shadow-xl shadow-blue-500/20' 
                : 'border-neutral-700/50 bg-neutral-900/60'
            } transition-all duration-300 cursor-pointer hover:border-neutral-600`}
            onClick={() => setSelectedPlan('free')}
          >
            <div className="flex flex-col h-full">
              <h2 className="text-3xl font-bold text-white">Free</h2>
              <p className="mt-2 text-neutral-400">Perfect for trying out</p>
              
              <div className="mt-6 flex items-baseline">
                <span className="text-6xl font-extrabold text-white">₹0</span>
                <span className="ml-2 text-neutral-400 text-lg">/month</span>
              </div>

              <div className="mt-10 space-y-4 flex-grow">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-300">
                    <span className="font-semibold">5 iterations</span> per day
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-300">
                    <span className="font-semibold">Basic AI model</span> - Standard generation quality
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-300">
                    <span className="font-semibold">5 projects</span> per account
                  </span>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-neutral-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-500">Download Unavailable</span>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-neutral-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-500">Advanced AI model</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubscribe('free')
                }}
                className="mt-10 w-full bg-neutral-700 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-neutral-600 transition-colors duration-300"
              >
                Get Started Free
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div 
            className={`p-8 rounded-2xl border-2 relative ${
              selectedPlan === 'pro' 
                ? 'border-blue-500 bg-gradient-to-br from-blue-950/40 to-neutral-900/90 shadow-xl shadow-blue-500/20' 
                : 'border-blue-500/50 bg-gradient-to-br from-blue-950/20 to-neutral-900/60'
            } transition-all duration-300 cursor-pointer hover:border-blue-400`}
            onClick={() => setSelectedPlan('pro')}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-full shadow-lg">
                RECOMMENDED
              </span>
            </div>

            <div className="flex flex-col h-full">
              <h2 className="text-3xl font-bold text-white">Pro</h2>
              <p className="mt-2 text-blue-300">For professional builders</p>

              <div className="mt-6 flex items-baseline">
                <span className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">₹100</span>
                <span className="ml-2 text-neutral-400 text-lg">/month</span>
              </div>

              <div className="mt-10 space-y-4 flex-grow">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-200">
                    <span className="font-semibold text-white">Unlimited iterations</span> - No daily limits
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-200">
                    <span className="font-semibold text-white">Advanced AI model</span> - 3x smarter
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-200">
                    <span className="font-semibold text-white">Unlimited Projects</span> - Generate as many projects as you like
                  </span>
                </div>
                {/* <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-200">
                    <span className="font-semibold text-white">Priority generation speed</span> - 5x faster queue
                  </span>
                </div> */}
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-neutral-200"><span className="font-semibold">Download</span> - Export the React codebase</span>
                </div>
                
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubscribe('pro')
                }}
                className="mt-10 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-neutral-500 text-sm mt-8">
          All plans include secure cloud storage and regular updates
        </p>
      </div>
    </div>
  )
}

export default ViewPlansPage