import { test, expect } from '@playwright/test'

test('VPS HTTPS: consent, real capture sync and owner-scoped deletion', async ({ page }) => {
  test.skip(process.env.TEST_LIVE_API !== '1', 'Opt-in test against the deployed VPS')
  await page.goto('./#/cai-dat')
  const consent = page.getByRole('checkbox', { name: 'Đồng ý lưu tiến bộ online' })
  await expect(consent).toBeEnabled()
  await consent.check()
  await expect(page.getByText(/Đã bật lưu online/)).toBeVisible({ timeout: 25000 })
  await page.goto('./#/san-dinh')
  const uploaded = page.waitForResponse(
    (response) => response.url().includes('/v1/attempts/') && response.status() === 200,
    { timeout: 30000 },
  )
  await page.getByRole('button', { name: 'Đến lượt bạn', exact: true }).click()
  await uploaded
  await page.getByRole('link', { name: 'Xem tiến bộ', exact: true }).click()
  await expect(page.getByText('Đã đồng bộ', { exact: true })).toBeVisible()
  await page.goto('./#/cai-dat')
  await page.getByRole('button', { name: 'Xóa tiến bộ của tôi' }).click()
  const deleted = page.waitForResponse(
    (response) =>
      response.url().includes('/v1/progress') &&
      response.request().method() === 'DELETE' &&
      response.status() === 204,
  )
  await page.getByRole('button', { name: 'Xóa dữ liệu', exact: true }).click()
  await deleted
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('./#/tien-bo')
  await expect(
    page.getByRole('heading', { name: 'Mỗi hành trình bắt đầu từ một nhịp' }),
  ).toBeVisible()
})
