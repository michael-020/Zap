import { getSystemPrompt } from "@/lib/prompts";
import { openai } from "@/lib/server/openai";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import axios from "axios";
import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const chatStreamSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1)
    })
  ),
  prompt: z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1)
  }),
  images: z.array(z.string()).optional(),
  url: z.string()
});

function generateUniqueFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.-]/g, '_');
  return `screenshot_${timestamp}.png`;
}

// Helper function to create image content objects
function createImageContent(images: string[]) {
  return images.map(image => ({
    type: "image_url" as const,
    image_url: {
      url: image,
      detail: "high" as const
    }
  }));
}

// Helper function to format messages with images
function formatMessagesWithImages(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  prompt: { role: "user" | "assistant" | "system"; content: string },
  images?: string[]
): ChatCompletionMessageParam[] {
  
  const inputMessages: ChatCompletionMessageParam[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));

  let finalPrompt: ChatCompletionMessageParam;
  
  if (images && images.length > 0) {
    finalPrompt = {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt.content
        },
        ...createImageContent(images)
      ]
    };
  } else {
    finalPrompt = {
      role: prompt.role,
      content: prompt.content
    };
  }

  return [
    {
      role: "system",
      content: getSystemPrompt()
    },
    ...inputMessages,
    finalPrompt
  ];
}

// Improved screenshot function with lazy loading support
async function takeFullPageScreenshot(page: Page, url: string) {
  try {
    // Set viewport to a reasonable size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Navigate to the page with extended timeout and wait for network idle
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for initial page load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Auto-scroll to trigger lazy loading
    await autoScroll(page);

    // Wait a bit more for any final lazy-loaded content
     await new Promise(resolve => setTimeout(resolve, 2000))

    // Try to close any popups or modals that might interfere
    await dismissPopups(page);

    // Take the screenshot with the full page height
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
      clip: undefined,
      encoding: "base64"
    });

    return screenshot;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}

// Function to auto-scroll and trigger lazy loading
async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const scrollDelay = 100;
      
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Stop scrolling when we reach the bottom
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          // Scroll back to top
          window.scrollTo(0, 0);
          resolve();
        }
      }, scrollDelay);
    });
  });
}

// Function to dismiss common popups and modals
async function dismissPopups(page: Page) {
  try {
    // Common selectors for close buttons, overlays, and popups
    const popupSelectors = [
      '[aria-label="Close"]',
      '[aria-label="close"]',
      '.close',
      '.close-button',
      '.modal-close',
      '.popup-close',
      '[data-testid="close"]',
      '[data-testid="close-button"]',
      'button[title="Close"]',
      '.overlay .close',
      '#cookie-banner .close',
      '.cookie-notice .close',
      '.newsletter-popup .close'
    ];

    for (const selector of popupSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const isVisible = await element.isIntersectingViewport();
          if (isVisible) {
            await element.click();
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation
          }
        }
      } catch (e) {
        // Ignore errors for individual selectors
        console.error("Error while dismissing pop ups: ", e)
        continue;
      }
    }

    // Handle cookie banners specifically
    try {
      await page.evaluate(() => {
        // Look for cookie consent buttons
        const cookieButtons = document.querySelectorAll('button');
        cookieButtons.forEach(button => {
          const text = button.textContent?.toLowerCase() || '';
          if (text.includes('accept') || text.includes('agree') || text.includes('ok')) {
            const rect = button.getBoundingClientRect();
            if (rect.top < window.innerHeight) { // Only click if visible
              (button as HTMLElement).click();
            }
          }
        });
      });
    } catch (e) {
      // Ignore cookie banner handling errors
      console.error("Error while evaluating: ", e)
    }
  } catch (error) {
    console.log('Error dismissing popups:', error);
    // Don't throw, just continue
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { msg: "You are not authorised to access this endpoint" },
        { status: 401 }
      );
    }
    
    const validatedSchema = chatStreamSchema.safeParse(await req.json());
    if (!validatedSchema.success) {
      console.error("Validation error:", validatedSchema.error);
      return NextResponse.json(
        { msg: "Invalid Inputs", errors: validatedSchema.error.errors },
        { status: 400 }
      );
    }
    
    const { messages, prompt, images, url } = validatedSchema.data;

    console.log("url: ", url);
    
    if (url.replace(/\n/g, '').trim() === "not a url".toLowerCase()) {
      // Handle non-URL case (existing logic)
      if (images && images.length > 0) {
        const invalidImages = images.filter(image => {
          return !image.startsWith('data:image/') || !image.includes('base64,');
        });
        
        if (invalidImages.length > 0) {
          return NextResponse.json(
            { msg: "Invalid image format. Images must be base64 data URLs." },
            { status: 400 }
          );
        }
        
        if (images.length > 10) {
          return NextResponse.json(
            { msg: "Too many images. Maximum 10 images allowed." },
            { status: 400 }
          );
        }
      }

      const formattedMessages = formatMessagesWithImages(messages, prompt, images);
      
      const completion = await openai.chat.completions.create({
        model: "gemini-2.0-flash-exp",
        messages: formattedMessages,
        stream: true,
        max_completion_tokens: 800_000
      });
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0].delta.content;
              if (content) {
                console.log("Chunk content:", content);
                controller.enqueue(encoder.encode(content));
              }
            }
          } catch (streamError) {
            console.error("Error in stream:", streamError);
            controller.error(streamError);
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked"
        }
      });
    }
    else {
      // Handle URL screenshot case
      let browser;
      try {
        // Check if the URL starts with 'https://', if not, add it
        let correctUrl = url;
        if (!url.startsWith("https://") && !url.startsWith("http://")) {
          correctUrl = `https://${url}`;
        }

        // First check if URL is reachable
        const res = await axios.get(correctUrl, { timeout: 10000 });

        if (res.status === 404) {
          console.log("URL not found:", res.data);
          return NextResponse.json(
            { msg: "Url not found" },
            { status: 404 }
          );
        }

        // Launch browser with better settings for screenshot
        browser = await puppeteer.launch({
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

        const page = await browser.newPage();

        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Take the improved screenshot
        const screenshot = await takeFullPageScreenshot(page, correctUrl);

        const filename = generateUniqueFilename();
        const filePath = path.join(process.cwd(), 'public/screenshots', filename);
        
        // Ensure the screenshots directory exists
        const screenshotsDir = path.join(process.cwd(), 'public/screenshots');
        if (!fs.existsSync(screenshotsDir)) {
          fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        
        // Write the screenshot to the file system
        fs.writeFileSync(filePath, screenshot, 'base64');
        
        console.log("Screenshot saved at:", filePath);

        // FIXED: Convert base64 buffer to proper data URL string
        const screenshotDataUrl = `data:image/png;base64,${screenshot}`;
        
        // Validate the screenshot format before sending
        if (!screenshotDataUrl.startsWith('data:image/')) {
          throw new Error('Invalid screenshot format generated');
        }

        const formattedMessages = formatMessagesWithImages(messages, prompt, [screenshotDataUrl]);
      
        const completion = await openai.chat.completions.create({
          model: "gemini-2.0-flash-exp", // Updated to more recent model
          messages: formattedMessages,
          stream: true,
          max_completion_tokens: 800_000
        });
        
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of completion) {
                const content = chunk.choices[0].delta.content;
                if (content) {
                  console.log("Chunk content:", content);
                  controller.enqueue(encoder.encode(content));
                }
              }
            } catch (streamError) {
              console.error("Error in stream:", streamError);
              controller.error(streamError);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain",
            "Transfer-Encoding": "chunked"
          }
        });

      } catch (error) {
        console.error("Error while processing URL:", error);

        // Check for network-related errors
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === 'ENOTFOUND'
        ) {
          return NextResponse.json(
            { msg: `URL not found (DNS resolution error)` },
            { status: 404 }
          );
        }

        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === 'ECONNABORTED'
        ) {
          return NextResponse.json(
            { msg: "Request Timeout: Unable to reach the URL" },
            { status: 408 }
          );
        }

        return NextResponse.json(
          { msg: "Error capturing screenshot", error: error instanceof Error ? error.message : "Unknown error" },
          { status: 500 }
        );
      } finally {
        // Always close the browser
        if (browser) {
          await browser.close();
        }
      }
    }
  } catch (error) {
    console.error("Error while chatting: ", error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { msg: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes('invalid_request')) {
        return NextResponse.json(
          { msg: "Invalid request format or content." },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}