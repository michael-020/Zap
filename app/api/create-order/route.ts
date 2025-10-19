import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

export async function POST(req: NextRequest){
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }
        const order = await razorpay.orders.create({
            amount: 100 * 100,
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7)
        })

        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                isPremium: true,
            },
        });


        return NextResponse.json(
            { orderId: order.id }
        )
    } catch (error) {
        console.error("Error while creating order: ", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}