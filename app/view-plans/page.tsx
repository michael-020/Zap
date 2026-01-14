"use client"

import Navbar from "@/components/navbar"
import RightSidebar from "@/components/sidebar" 
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const ViewPlansPage = () => {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro')
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const onBackHandler = () => {
    router.push("/chat")
  }

  useEffect(() => {
    const threshold = 25;
    const sidebarWidth = 256; 
  
    const onMouseMove = (e: MouseEvent) => {
      const isNearRightEdge = window.innerWidth - e.clientX <= threshold;
      const isInsideSidebar = e.clientX >= window.innerWidth - sidebarWidth;
      
      if (isNearRightEdge) {
        setIsHovered(true);
      } else if (!isInsideSidebar && isHovered) {
        setIsHovered(false);
      }
    };
  
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isHovered]);
 
  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSidebarClose = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

  const sidebarVisible = isOpen || isHovered;

  const handleSubscribe = async (plan: 'free' | 'pro') => {
    if (plan === 'free') {
      router.push('/chat')
      return
    }
    else if(plan == 'pro'){
      const res = await fetch("/api/payment-token");
      const { token } = await res.json();

      window.location.href =
        `http://localhost:3001/payment-page?token=${token}`;
    }
  }

  return (
    <div className="overflow-hidden">
      <Navbar 
        onBack={onBackHandler} 
        showBackButton={true} 
        showPanelToggle={true}
        onPanelToggle={() => setIsOpen(!isOpen)} 
      />
      <div className="min-h-screen bg-neutral-50 dark:bg-black translate-y-8 flex items-center justify-center p-4 pyb-0">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Build stunning websites with AI-powered generation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 ">
            {/* Free Plan */}
            <div 
              className={`p-8 rounded-2xl border-2 ${
                selectedPlan === 'free' 
                ? 'border-purple-500/50 bg-white dark:bg-neutral-900/90 shadow-xl shadow-purple-500/20' 
                : 'border-neutral-200 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/60'
              } transition-all duration-300 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700`}
              onClick={() => setSelectedPlan('free')}
              >
              <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Free</h2>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Perfect for trying out</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-6xl font-extrabold text-neutral-900 dark:text-white">₹0</span>
                  {/* <span className="ml-2 text-neutral-600 dark:text-neutral-400 text-lg">/month</span> */}
                </div>

                <div className="mt-10 space-y-4 flex-grow">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">5 iterations</span> per day
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">Basic AI model</span> - Standard generation quality
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">5 projects</span> per account
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">5 downloads</span> per account
                    </span>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-neutral-400 dark:text-neutral-600 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-500 dark:text-neutral-500">Advanced AI model</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSubscribe('free')
                  }}
                  className="mt-10 w-full bg-neutral-900 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-800/80 transition-colors duration-300"
                  >
                  Get Started Free
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div 
              className={`p-8 rounded-2xl border-2 relative ${
                selectedPlan === 'pro' 
                ? 'border-purple-500/60 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/20 dark:to-neutral-900/90 shadow-xl shadow-purple-500/20' 
                : 'border-purple-500/50 bg-gradient-to-br from-purple-50/30 to-white dark:from-purple-950/20 dark:to-neutral-900/60'
              } transition-all duration-300 cursor-pointer hover:border-purple-400/50`}
              onClick={() => setSelectedPlan('pro')}
              >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-800 dark:to-purple-900 text-white text-sm font-semibold rounded-full shadow-lg">
                  RECOMMENDED
                </span>
              </div>

              <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Pro</h2>
                <p className="mt-2 text-purple-600 dark:text-purple-300">For professional builders</p>

                <div className="mt-6 flex items-baseline">
                  <span className="text-6xl font-extrabold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">₹99</span>
                  {/* <span className="ml-2 text-neutral-600 dark:text-neutral-400 text-lg">/month</span> */}
                  <span className="ml-2 text-neutral-600 dark:text-neutral-400 text-lg">Pay once, enjoy forever</span>
                </div>

                <div className="mt-10 space-y-4 flex-grow">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-200">
                      <span className="font-semibold text-neutral-900 dark:text-white">Unlimited iterations</span> - No daily limits
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-200">
                      <span className="font-semibold text-neutral-900 dark:text-white">Advanced AI model</span> - 3x smarter
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-200">
                      <span className="font-semibold text-neutral-900 dark:text-white">Unlimited Projects</span> - Generate as many projects as you like
                    </span>
                  </div>
                  {/* <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-200">
                    <span className="font-semibold text-white">Priority generation speed</span> - 5x faster queue
                    </span>
                    </div> */}
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-neutral-700 dark:text-neutral-200"><span className="font-semibold text-neutral-900 dark:text-white">Unlimited downloads</span> - Export the Project&apos;s codebase</span>
                  </div>
                  
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSubscribe('pro')
                  }}
                  className="mt-10 w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3.5 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 dark:from-purple-400/70 dark:to-purple-500/70 dark:hover:from-purple-500/60 dark:hover:to-purple-400/60 transition-all duration-300 shadow-lg shadow-purple-500/30"
                  >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-neutral-500 dark:text-neutral-500 text-sm mt-8">
            All plans include secure cloud storage and regular updates
          </p>
        </div>
      </div>
      
      <RightSidebar
        isOpen={sidebarVisible}
        setIsOpenAction={handleSidebarClose}
        onMouseLeaveAction={handleSidebarMouseLeave}
      />
    </div>
  )
}

export default ViewPlansPage