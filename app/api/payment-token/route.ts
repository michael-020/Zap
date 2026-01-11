import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }

  const token = jwt.sign(
    {
      userId: session.user.id,
      purpose: "payment",
    },
    process.env.PAYMENT_JWT_SECRET!,
    { expiresIn: "10m" }
  );

  return NextResponse.json({ token });
}
