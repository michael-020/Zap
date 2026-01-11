import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const ALLOWED_ORIGIN = "http://localhost:3001";

function cors(origin: string | null): Record<string, string> {
  if (origin === ALLOWED_ORIGIN) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
  }

  return {};
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: cors(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest){
    const origin = req.headers.get("origin");

    try {
        const auth = req.headers.get("authorization");
        if (!auth) {
            return NextResponse.json({ msg: "No token" }, { status: 401 });
        }

        const token = auth.split(" ")[1];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = jwt.verify(
            token,
            process.env.PAYMENT_JWT_SECRET!
        );

        console.log("payload: ", payload)

        const { amount } = await req.json();
        console.log("amount: ", amount)

        const order = await razorpay.orders.create({
            amount: amount*100,
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7)
        })

        console.log(Object.keys(prisma));

        await prisma.payment.create({
            data: {
                userId: payload.userId,
                orderId: order.id,
                amount,
                currency: "INR",
                status: "PENDING",
            },
        });

        return NextResponse.json(
            { orderId: order.id },
            { headers: cors(origin) }
        )
    } catch (error) {
        console.error("Error while creating order: ", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}