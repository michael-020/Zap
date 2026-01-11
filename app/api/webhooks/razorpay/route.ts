import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const razorpaySignature =
      req.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      return NextResponse.json(
        { msg: "Missing Razorpay signature" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET!
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { msg: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return NextResponse.json(
        { msg: "Order ID missing in webhook" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    switch (eventType) {
      case "payment.captured": {
        if (payment.status === "SUCCESS") break;

        await prisma.$transaction([
          prisma.payment.update({
            where: { orderId },
            data: {
              status: "SUCCESS",
              paymentId,
            },
          }),
          prisma.user.update({
            where: { id: payment.userId },
            data: { isPremium: true },
          }),
        ]);
        break;
      }

      case "payment.failed": {
        if (payment.status !== "PENDING") break;

        await prisma.payment.update({
          where: { orderId },
          data: { status: "FAILED" },
        });
        break;
      }

      case "payment.dispute.created":
      case "payment.dispute.under_review": {
        if (payment.status === "DISPUTED") break;

        await prisma.payment.update({
          where: { orderId },
          data: { status: "DISPUTED" },
        });
        break;
      }

      case "payment.dispute.won": {
        await prisma.payment.update({
          where: { orderId },
          data: { status: "SUCCESS" },
        });
        break;
      }

      case "payment.dispute.lost": {
        await prisma.$transaction([
          prisma.payment.update({
            where: { orderId },
            data: { status: "REFUNDED" },
          }),
          prisma.user.update({
            where: { id: payment.userId },
            data: { isPremium: false },
          }),
        ]);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { msg: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
