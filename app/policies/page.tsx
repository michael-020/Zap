"use client"

import Navbar from "@/components/navbar"
import RightSidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './policies.module.css';

const PoliciesPage = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const onBackHandler = () => {
    router.push("/")
  }

  useEffect(() => {
    const threshold = 25
    const sidebarWidth = 256

    const onMouseMove = (e: MouseEvent) => {
      const isNearRightEdge = window.innerWidth - e.clientX <= threshold
      const isInsideSidebar = e.clientX >= window.innerWidth - sidebarWidth
      
      if (isNearRightEdge) {
        setIsHovered(true)
      } else if (!isInsideSidebar && isHovered) {
        setIsHovered(false)
      }
    }

    document.addEventListener("mousemove", onMouseMove)
    return () => document.removeEventListener("mousemove", onMouseMove)
  }, [isHovered])

  const handleSidebarMouseLeave = () => {
    setIsHovered(false)
  }

  const handleSidebarClose = () => {
    setIsOpen(false)
    setIsHovered(false)
  }

  const sidebarVisible = isOpen || isHovered

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar">
      <Navbar 
        onBack={onBackHandler} 
        showBackButton={true} 
        showPanelToggle={true}
        onPanelToggle={() => setIsOpen(!isOpen)} 
      />
      <div className="min-h-screen bg-neutral-50 dark:bg-black pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Policies & Terms
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Last updated: January 22, 2026
            </p>
          </div>

          <div className="space-y-12">
            {/* Terms of Service */}
            <section className="bg-white dark:bg-neutral-900/60 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800/50">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Terms of Service
              </h2>
              <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <p>
                  By accessing and using Zap, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our service.
                </p>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    1. Service Description
                  </h3>
                  <p>
                    Zap is an AI-powered website generation platform that allows users to create 
                    websites through conversational interactions. We provide both free and paid 
                    subscription tiers with varying features and usage limits.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2. User Responsibilities
                  </h3>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials 
                    and for all activities that occur under your account. You agree not to use Zap for 
                    any illegal or unauthorized purpose, including but not limited to generating harmful, 
                    fraudulent, or misleading content.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    3. Content Ownership
                  </h3>
                  <p>
                    You retain all rights to the content and websites you create using Zap. However, 
                    you grant us a limited license to store and process your content to provide our services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    4. Acceptable Use
                  </h3>
                  <p>
                    You may not use Zap to create content that infringes on intellectual property rights, 
                    contains malicious code, promotes illegal activities, or violates any applicable laws 
                    or regulations.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment & Subscription */}
            <section className="bg-white dark:bg-neutral-900/60 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800/50">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Payment & Subscription Policy
              </h2>
              <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    1. Pricing Plans
                  </h3>
                  <p className="mb-3">
                    Zap offers two pricing tiers:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <span className="font-semibold text-neutral-900 dark:text-white">Free Plan:</span> Limited 
                      to 5 iterations per day, 5 projects per account, 5 downloads per account, and access 
                      to our basic AI model.
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900 dark:text-white">Pro Plan:</span> One-time 
                      payment of ₹99 for lifetime access to unlimited iterations, unlimited projects, unlimited 
                      downloads, and our advanced AI model.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2. Payment Processing
                  </h3>
                  <p>
                    All payments are processed securely through our payment gateway. By providing payment 
                    information, you authorize us to charge the specified amount for your chosen plan.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    3. Pro Plan - Lifetime Access
                  </h3>
                  <p>
                    The Pro Plan is a one-time payment that grants you lifetime access to all Pro features. 
                    This is not a recurring subscription and you will not be charged again unless you choose 
                    to purchase additional services in the future.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="bg-white dark:bg-neutral-900/60 rounded-2xl p-8 border-2 border-purple-500/30 dark:border-purple-500/20">
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Refund Policy
                  </h2>
                  <p className="text-purple-600 dark:text-purple-400 font-semibold mt-1">
                    Important: Please read carefully
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-6">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-3 text-lg">
                    No Refund Policy
                  </h3>
                  <p className="mb-3">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      All sales of the Pro Plan are final and non-refundable.
                    </span> Once you have completed your 
                    purchase and payment has been processed, you will not be eligible for a refund under 
                    any circumstances.
                  </p>
                  <p>
                    This policy applies regardless of:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>How much you have used the service</li>
                    <li>Whether you change your mind after purchase</li>
                    <li>Technical issues on your end</li>
                    <li>Any other reason</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Why No Refunds?
                  </h3>
                  <p>
                    The Pro Plan is offered at a significantly discounted one-time price for lifetime access. 
                    Due to the nature of digital services and the immediate access granted upon purchase, 
                    we cannot offer refunds. We encourage you to try our Free Plan first to ensure Zap 
                    meets your needs before upgrading.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Try Before You Buy
                  </h3>
                  <p>
                    We strongly recommend using our Free Plan to familiarize yourself with Zap&apos;s 
                    features and capabilities before purchasing the Pro Plan. The Free Plan provides 
                    5 iterations per day, which should give you a good understanding of our service.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy Policy */}
            <section className="bg-white dark:bg-neutral-900/60 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800/50">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Privacy Policy
              </h2>
              <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    1. Data Collection
                  </h3>
                  <p>
                    We collect information you provide directly to us, including your name, email address, 
                    payment information, and the content you create using our platform. We also collect 
                    usage data to improve our services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2. Data Usage
                  </h3>
                  <p>
                    Your data is used to provide and improve our services, process payments, communicate 
                    with you, and ensure platform security. We do not sell your personal information to 
                    third parties.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    3. Data Security
                  </h3>
                  <p>
                    We implement industry-standard security measures to protect your data. However, no 
                    method of transmission over the Internet is 100% secure, and we cannot guarantee 
                    absolute security.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    4. Your Rights
                  </h3>
                  <p>
                    You have the right to access, correct, or delete your personal data. You can also 
                    request data portability and object to certain data processing activities. Contact 
                    us to exercise these rights.
                  </p>
                </div>
              </div>
            </section>

            {/* Usage Limits */}
            <section className="bg-white dark:bg-neutral-900/60 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800/50">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Usage Limits & Fair Use
              </h2>
              <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <p>
                  While Pro users have access to unlimited iterations and projects, we expect all users 
                  to use our service fairly and reasonably. Excessive or abusive use that impacts service 
                  quality for other users may result in temporary restrictions or account suspension.
                </p>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Examples of Excessive Use:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Automated or bot-driven generation requests</li>
                    <li>Commercial reselling of generated content</li>
                    <li>Intentional system abuse or exploitation</li>
                    <li>Using our service to provide services to third parties</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Service Availability */}
            <section className="bg-white dark:bg-neutral-900/60 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800/50">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Service Availability & Changes
              </h2>
              <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    1. Service Uptime
                  </h3>
                  <p>
                    While we strive to maintain 99.9% uptime, we do not guarantee uninterrupted service. 
                    Scheduled maintenance and unexpected outages may occur. We will notify users of planned 
                    maintenance when possible.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2. Feature Changes
                  </h3>
                  <p>
                    We reserve the right to modify, add, or remove features at any time. Pro Plan users 
                    will continue to have access to core features, though specific implementations may change 
                    as we improve our service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    3. Service Termination
                  </h3>
                  <p>
                    We reserve the right to terminate or suspend accounts that violate our terms of service. 
                    In the event we discontinue our service entirely, we will provide reasonable notice and 
                    assistance with data export.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/20 dark:to-neutral-900/60 rounded-2xl p-8 border border-purple-200 dark:border-purple-800/30">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Contact Us
              </h2>
              <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
                <p>
                  If you have any questions about these policies or need support, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold text-neutral-900 dark:text-white">Email:</span> zap.ai.help@gmail.com
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-900 dark:text-white">Response Time:</span> Within 24-48 hours
                  </p>
                </div>
              </div>
            </section>

            {/* Agreement */}
            <section className="bg-neutral-100 dark:bg-neutral-900/40 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800/30">
              <p className="text-neutral-700 dark:text-neutral-300 text-center">
                By using Zap, you acknowledge that you have read, understood, and agree to be bound by 
                these policies. If you do not agree with any part of these policies, please do not use 
                our service.
              </p>
            </section>
          </div>
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

export default PoliciesPage