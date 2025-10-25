import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest){
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { msg: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Payment verified - now upgrade user
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                isPremium: true,
            },
        });

        return NextResponse.json(
            { msg: "Payment verified and user upgraded successfully" }
        )
    } catch (error) {
        console.error("Error while verifying payment: ", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}