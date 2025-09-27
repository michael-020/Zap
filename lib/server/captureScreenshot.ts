import puppeteer from "puppeteer";

export async function capturePreviewImage(url: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Capture the screenshot and return it as a base64 string
    const screenshotBase64 = await page.screenshot({ encoding: 'base64' });

    await browser.close();
    console.log("image captured: ", screenshotBase64)
    return screenshotBase64;
}