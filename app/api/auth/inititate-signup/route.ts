import { generateOTP, sendOTP } from "@/lib/server/emailService";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod"

const emailSchema = z.object({
    email: z.string().email()
})

export async function POST(req: NextRequest){
    try {
        const validatedSchema = emailSchema.safeParse(await req.json())

        if(!validatedSchema.success){
            return NextResponse.json(
                { msg: "Invalid email" },
                { status: 403 }
            )
        }
        const email = validatedSchema.data.email
        const existingEmail = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(existingEmail){
            return NextResponse.json(
                { msg: "Email already exists, Please sign-in"},
                { status: 403 }
            )
        }

        const otp = generateOTP()
        await prisma.oTP.upsert({  
            where: { 
                email 
            },
            update: { 
                otp, 
                createdAt: new Date() 
            },
            create: {
                email,
                otp,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        })

        const emailSent = sendOTP(email, otp)
        if(!emailSent){
            return NextResponse.json(
                { msg: "Failed to send OTP, please try again."},
                { status: 500}
            )
        }

        return NextResponse.json(
            { msg: "OTP sent successfully" },
            { status: 200 }
        )
        
    } catch (error) {
        console.error("Error while initiating signup: ", error)
        NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 } 
        )
    }
}