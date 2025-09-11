import axios from "axios";
import { NextRequest, NextResponse } from "next/server"
import path from "path";
import puppeteer, { Page } from "puppeteer";
import fs from 'fs';

function generateUniqueFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.-]/g, '_');
  return `screenshot_${timestamp}.png`;
}

async function takeFullPageScreenshot(page: Page, url: string) {
  try {
    // Set viewport to a reasonable size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
    });

    // Navigate to the page with extended timeout and wait for network idle
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000
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
      type: "webp",
      clip: undefined,
      encoding: "base64", 
      quality: 100
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
     // Launch browser with better settings for screenshot
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
        const { url } = await req.json()
        // Check if the URL starts with 'https://', if not, add it
        const correctUrl = url;
        // console.log("correct url: ", correctUrl)
        // if (!url.startsWith("https://") && !url.startsWith("http://")) {
        //   correctUrl = `https://${url}`;
        // }

        // First check if URL is reachable
        const res = await axios.get(correctUrl, { timeout: 10000 });

        if (res.status === 404) {
          console.log("URL not found:", res.data);
          return NextResponse.json(
            { msg: "Url not found" },
            { status: 404 }
          );
        }

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

        return NextResponse.json(
            { 
                images: screenshotDataUrl
            }
        )
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
        browser.close()
    }
}