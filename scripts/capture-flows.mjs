import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.join(process.cwd(), "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 460, height: 920 } });
await page.goto("http://127.0.0.1:3848/", { waitUntil: "networkidle" });

async function shot(name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
}

await shot("01-login.png");

await page.getByRole("button", { name: /Northside Scaffolding/ }).click();
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("heading", { name: "Jobs" }).waitFor();
await shot("02-company-jobs.png");

await page.getByRole("button", { name: "My Jobs", exact: true }).click();
await page.getByRole("button", { name: "Publish this job" }).first().click();
await page.getByRole("button", { name: /Pay €29 for this job/ }).waitFor();
await shot("03-plan-full.png");

await page.getByRole("button", { name: /Pay €29 for this job/ }).click();
await page.getByRole("button", { name: /^Pay €29$/ }).click();
await page.getByRole("heading", { name: "Published" }).waitFor({ timeout: 5000 });
await shot("04-one-off-live.png");

await page.getByRole("button", { name: "Back to jobs" }).click();
await page.getByRole("button", { name: "Account" }).click();
await page.getByRole("button", { name: "Plans" }).click();
await page.getByRole("button", { name: "Choose Growth" }).click();
await page.getByRole("button", { name: /^Pay €79$/ }).click();
await page.getByText("Growth is active").waitFor({ timeout: 5000 });
await shot("05-plan-active.png");

if (await page.getByRole("heading", { name: "Sign in" }).count() === 0) {
  if (await page.getByRole("button", { name: "View plan" }).count()) {
    await page.getByRole("button", { name: "Back to jobs" }).click();
  }
  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
}

await page.getByRole("heading", { name: "Sign in" }).waitFor();
await page.getByRole("button", { name: /Aisha Murphy/ }).click();
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByText("Jobs near you").or(page.getByRole("heading", { name: "Search" })).waitFor();
await shot("06-worker-map.png");
await page.getByRole("button", { name: "View job" }).first().click();
await page.getByRole("button", { name: "Send application" }).click();
await page.getByText("Sent").first().waitFor();
await shot("07-worker-sent.png");

await browser.close();
console.log("all flows ok");
