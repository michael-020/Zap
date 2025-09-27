import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { takeFullPageScreenshot } from "../../get-images/route";
import cloudinary from "@/lib/server/cloudinary";

export async function DELETE(
    req: NextResponse,
    { params }: { params: Promise<{ projectId: string }> }
){
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }

        const { projectId } = await params

         const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                chats: true 
            }
        });

        if (!project) {
            return NextResponse.json(
                { msg: "Project not found" },
                { status: 400 }
            );
        }

        if (project.chats.length > 0) {
            await prisma.chat.deleteMany({
                where: {
                    projectId
                }
            });
        }

        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        return NextResponse.json(
            { msg: "Project deleted successfully" }
        );
    } catch (error) {
        console.error("Error while deleting project", error)
        return NextResponse.json(
            { msg: "Internal server error" },
            { status: 500 }
        )
    }
}


export async function PUT(
    req: NextResponse,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const browser = await puppeteer.launch({
        headless: true, // Changed to headless: true for production
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
        ]
    });
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return NextResponse.json(
                { msg: "You are not authorised to access this endpoint" },
                { status: 401}
            )
        }

        const { name: newName, previewUrl: newPreviewUrl } = await req.json()
        const { projectId } = await params;

        const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        });

        if (!project) {
            return NextResponse.json(
                { msg: "Project not found" },
                { status: 400 }
            );
        }

        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Take the improved screenshot
        const screenshot = await captureIframeScreenshot(newPreviewUrl);

        // FIXED: Convert base64 buffer to proper data URL string
        const screenshotDataUrl = `data:image/png;base64,${screenshot}`;

        const uploadResponse = await cloudinary.uploader.upload(screenshotDataUrl);
        const imageUrl = uploadResponse.secure_url;

        const updatedData: { name?: string; previewUrl?: string } = {};

        if (newName !== undefined && newName !== null) {
            updatedData.name = newName;
        }

        if (imageUrl !== undefined && imageUrl !== null) {
            updatedData.previewUrl = imageUrl;
        }

        if (Object.keys(updatedData).length === 0) {
        return NextResponse.json(
            { msg: "No data to update" },
            { status: 400 }
        );
        }

        await prisma.project.update({
            where: {
                id: projectId,
            },
            data: updatedData,
        });

        return NextResponse.json(
        { msg: "Project updated successfully" }
        );
    } catch (error) {
        console.error("Error while renaming project: ", error)
        return NextResponse.json(
            { msg: "Internal server error" },
            { status: 500 }
        )
    }
}

async function captureIframeScreenshot(iframeUrl: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    // Inject iframe into page and capture screenshot
    await page.setContent(`
        <html>
            <body>
                <iframe src="${iframeUrl}" width="100%" height="100%" id="previewIframe"></iframe>
            </body>
        </html>
    `);

    await page.waitForSelector('iframe#previewIframe'); // Wait for iframe to load
    const screenshot = await page.screenshot({
        fullPage: true,
        type: "webp",
        encoding: "base64",
        quality: 100
    });
    console.log("Screenshot: ", screenshot)
    await browser.close();
    return screenshot;
}