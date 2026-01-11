import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

        const payment = await prisma.payment.findUnique({
            where: { orderId: razorpay_order_id },
        });

        if (!payment) {
            return NextResponse.json(
                { msg: "Payment record not found" },
                { status: 404 }
            );
        }

        if (payment.status === "SUCCESS") {
            const res = NextResponse.json({ success: true });
            Object.entries(cors(origin)).forEach(([k, v]) =>
                res.headers.set(k, v)
            );
            return res;
        }

        await prisma.$transaction([
            prisma.payment.update({
                where: { orderId: razorpay_order_id },
                data: {
                status: "SUCCESS",
                paymentId: razorpay_payment_id,
                },
            }),
            prisma.user.update({
                where: { id: payload.userId },
                data: { isPremium: true },
            }),
        ]);

        return NextResponse.json(
            { msg: "Payment verified and user upgraded successfully" },
            { headers: cors(origin) }
        )
    } catch (error) {
        console.error("Error while verifying payment: ", error)
        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        )
    }
}