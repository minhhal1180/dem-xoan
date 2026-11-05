import { test, expect } from '@playwright/test'

test('iPhone WebKit opens generated artwork, routes and installation guide', async ({ page }) => {
  await page.goto('./')
  const image = page.locator('.courtyard-art')
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(1200)
  await expect(page.getByText('Tranh minh họa AI · Nhân vật hư cấu')).toBeVisible()
  for (const path of ['kham-pha', 'chuan-bi', 'san-dinh', 'tien-bo', 'giao-vien', 'cai-dat']) {
    await page.goto(`./#/${path}`)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await expect(page.getByText('iPhone / Safari:', { exact: true })).toBeVisible()
})

test('iPhone WebKit audio capability and microphone refusal remain recoverable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          throw new DOMException('Micro bị từ chối', 'NotAllowedError')
        },
      },
    })
  })
  await page.goto('./#/san-dinh')
  const hasWebAudio = await page.evaluate(() => typeof AudioContext !== 'undefined')
  await page.getByRole('button', { name: 'Nghe mẫu', exact: true }).click()
  if (hasWebAudio) {
    await expect(page.getByText('Đang phát mẫu · Lắng nghe', { exact: true })).toBeVisible()
  } else {
    // The Windows WebKit build omits Web Audio; this exercises the fallback only.
    await expect(page.getByRole('alert')).toContainText('Chưa phát được âm thanh')
  }
  await expect(page.getByRole('button', { name: 'Đến lượt bạn', exact: true })).toBeEnabled({
    timeout: 10000,
  })
  await page.getByRole('button', { name: 'Đến lượt bạn', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nghe mẫu', exact: true })).toBeEnabled()
})

test('iOS permission is requested on tap and sensor denial keeps screen mode usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'DeviceOrientationEvent', {
      configurable: true,
      value: class {
        static requestPermission() {
          ;(window as unknown as { sensorRequested: boolean }).sensorRequested = true
          return Promise.resolve('denied')
        }
      },
    })
  })
  await page.goto('./#/chuan-bi')
  await page.getByRole('button', { name: /Với kính giấy/ }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  expect(
    await page.evaluate(() => (window as unknown as { sensorRequested: boolean }).sensorRequested),
  ).toBe(true)
  await page.getByRole('button', { name: 'Vào sân đình', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Nghe mẫu', exact: true })).toBeVisible()
})
