/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { axiosInstance } from "@/lib/axios" 
import { Loader2 } from "lucide-react"
import { redirect, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import RightSidebar from "@/components/sidebar"

const PaymentPage = () => {
    const amount = 100; 
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(""); 
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()

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

    const handlePayment = async () => {
        if (!razorpayLoaded) {
            setPaymentStatus("Razorpay script not loaded. Please try again.");
            return;
        }

        setIsProcessing(true);
        setPaymentStatus("");

        try {
            const res = await axiosInstance.post("/api/create-order", { amount });
            const data = res.data;

            if (!data.orderId) {
                throw new Error("Order ID not received from server.");
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: "INR",
                name: "Your Company Name",
                description: "Test Transaction",
                order_id: data.orderId,
                handler: async function (response: any) {
                    console.log("Payment successful", response);
                    
                    try {
                        const verifyRes = await axiosInstance.post("/api/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        
                        if (verifyRes.data) {
                            setPaymentStatus(`Payment Successful! You are now a Premium user.`);
                        }
                        await new Promise(r => setTimeout(r, 2000))
                        redirect("/chat")
                    } catch (error) {
                        console.error("Payment verification failed", error);
                        setPaymentStatus("Payment completed but verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "johndoe@gmail.com",
                    contact: "9999999999",
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                console.log(response.error.description);
                setPaymentStatus(`Payment Failed: ${response.error.description}`);
            });
            rzp1.open();

        } catch (error) {
            console.error("Error while handling payment: ", error);
            setPaymentStatus("An error occurred. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Navbar
                onBack={onBackHandler} 
                showBackButton={true} 
                showPanelToggle={true}
                onPanelToggle={() => setIsOpen(!isOpen)} 
            />
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setRazorpayLoaded(true)}
            />

            <div className="min-h-screen bg-neutral-100 dark:bg-neutral-800/10 flex items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-neutral-200/50 dark:shadow-neutral-900 rounded-lg shadow-lg">
                    
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-200">
                            Complete Your Payment
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                           Securely pay with Razorpay
                        </p>
                    </div>

                    <div className="border-t border-b border-neutral-200 dark:border-neutral-700 py-6">
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-medium text-neutral-800 dark:text-neutral-300">Zap Pro</p>
                            <p className="text-lg font-bold text-neutral-800 dark:text-neutral-300">₹{amount.toFixed(2)}</p>
                        </div>
                         <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">A one-time purchase for our premium service.</p>
                    </div>

                    <div>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-purple-500/70 hover:bg-purple-500/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay ₹${amount.toFixed(2)} Now`
                            )}
                        </button>
                    </div>

                    {paymentStatus && (
                        <div className={`mt-4 text-center p-3 rounded-md ${
                            paymentStatus.includes('Successful') 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                            {paymentStatus}
                        </div>
                    )}
                    
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>🔒 All transactions are secure and encrypted.</p>
                    </div>

                </div>
            </div>

            <RightSidebar
                isOpen={sidebarVisible}
                setIsOpenAction={handleSidebarClose}
                onMouseLeaveAction={handleSidebarMouseLeave}
            />
        </>
    );
};

export default PaymentPage;