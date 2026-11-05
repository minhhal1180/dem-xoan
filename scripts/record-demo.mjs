import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const target = process.env.DEMO_URL || 'http://127.0.0.1:4173/dem-xoan/'
await mkdir('docs/demo', { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'reduce',
  recordVideo: { dir: 'test-results/demo-video', size: { width: 1280, height: 800 } },
})
await context.addInitScript(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const label = document.createElement('div')
    label.textContent = 'VIDEO THAO TÁC GIAO DIỆN TỰ ĐỘNG · KHÔNG CÓ ÂM THANH'
    label.style.cssText =
      'position:fixed;bottom:8px;right:12px;z-index:9999;background:#10232c;color:#ecdcb9;padding:6px 12px;border-radius:6px;font:10px sans-serif;pointer-events:none'
    document.body.append(label)
  })
})
const page = await context.newPage()
await page.goto(target)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2200)
await page.getByRole('link', { name: 'Khám phá di sản', exact: true }).click()
await page.waitForTimeout(2500)
await page.getByRole('link', { name: 'Vào sân đình', exact: true }).click()
await page.waitForTimeout(2000)
await page.getByRole('button', { name: 'Vào sân đình', exact: true }).click()
await page.waitForTimeout(2000)
await page.getByRole('button', { name: 'Nghe mẫu', exact: true }).click()
await page.waitForTimeout(5100)
await page.getByRole('link', { name: /Góc giáo viên/ }).click()
await page.waitForTimeout(2500)
await page.getByRole('link', { name: 'Thiết bị & tư liệu' }).click()
await page.waitForTimeout(1800)
const video = page.video()
await context.close()
await video.saveAs('docs/demo/interface-demo.webm')
await browser.close()
console.log('Recorded docs/demo/interface-demo.webm (automated UI, no audio).')
