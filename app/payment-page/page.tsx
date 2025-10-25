/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Script from "next/script"
import { axiosInstance } from "@/lib/axios" 
import { Loader2 } from "lucide-react"

const PaymentPage = () => {
    const amount = 100; 
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(""); 
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    const handlePayment = async () => {
        if (!razorpayLoaded) {
            setPaymentStatus("Razorpay script not loaded. Please try again.");
        }

        setIsProcessing(true);
        setPaymentStatus("");

        try {
            // Step 1: Create an order on your server
            const res = await axiosInstance.post("/api/create-order", { amount });
            const data = res.data;

            if (!data.orderId) {
                throw new Error("Order ID not received from server.");
            }

            // Step 2: Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: "INR",
                name: "Your Company Name",
                description: "Test Transaction",
                order_id: data.orderId,
                handler: function (response: any) {
                    console.log("Payment successful", response);
                    setPaymentStatus(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
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

            // Step 3: Open the Razorpay checkout modal
            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                console.log(response.error.description);
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
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setRazorpayLoaded(true)}
            />

            <div className="min-h-screen bg-neutral-800/10 flex items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-neutral-900 border border-neutral-800 shadow-neutral-900 rounded-lg shadow-lg">
                    
                    {/* Header */}
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-200">
                            Complete Your Payment
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-400">
                           Securely pay with Razorpay
                        </p>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-b border-gray-200 py-6">
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-medium text-neutral-300">Mirror Pro</p>
                            <p className="text-lg font-bold text-neutral-300">₹{amount.toFixed(2)}</p>
                        </div>
                         <p className="mt-1 text-sm text-neutral-300">A one-time purchase for our premium service.</p>
                    </div>

                    {/* Payment Button */}
                    <div>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || !razorpayLoaded}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="size-10 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay ₹${amount.toFixed(2)} Now`
                            )}
                        </button>
                    </div>

                    {/* Payment Status Message */}
                    {paymentStatus && (
                        <div className={`mt-4 text-center p-3 rounded-md ${paymentStatus.includes('Successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {paymentStatus}
                        </div>
                    )}
                    
                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        <p>🔒 All transactions are secure and encrypted.</p>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PaymentPage;
