"use server";

import jwt from "jsonwebtoken";

export async function createPaymentToken(user: {
  id: string;
  email: string;
}) {
  if (!process.env.PAYMENT_JWT_SECRET) {
    throw new Error("PAYMENT_JWT_SECRET is not defined");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      purpose: "payment",
    },
    process.env.PAYMENT_JWT_SECRET,
    { expiresIn: "10m" }
  );

  return token;
}