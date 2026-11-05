import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('main navigation, sources, QR and honest teacher fixtures', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: /Giữ một nhịp Xoan/ })).toBeVisible()
  await page.getByRole('button', { name: 'Chia sẻ trải nghiệm' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('dialog svg').last()).toBeVisible()
  await page.getByRole('button', { name: 'Đóng', exact: true }).click()
  await page.getByRole('link', { name: 'Khám phá di sản', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Đọc hồ sơ UNESCO' })).toHaveAttribute(
    'href',
    /ich.unesco.org/,
  )
  await expect(page.locator('.discovery-hero img')).toBeVisible()
  await page.getByRole('link', { name: /Góc giáo viên/ }).click()
  await expect(page.getByText(/Dữ liệu minh họa · Lớp giả lập 30 học sinh/)).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(30)
})

test('deep link and empty progress remain usable', async ({ page }) => {
  await page.goto('./#/tien-bo')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Hành trình của riêng bạn' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Mỗi hành trình bắt đầu từ một nhịp' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Bắt đầu luyện tập' }).click()
  await expect(page.getByRole('heading', { name: /Sẵn sàng/ })).toBeVisible()
  await page.getByRole('button', { name: 'Vào sân đình', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Nghe mẫu', exact: true })).toBeVisible()
  await expect(page.getByText(/Bài luyện minh họa — không phải câu Hát Xoan/)).toBeVisible()
})

test('microphone refusal produces a recoverable state', async ({ page, context }) => {
  await context.clearPermissions()
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('Quyền micro chưa được cấp.', 'NotAllowedError')
    }
  })
  await page.goto('./#/san-dinh')
  await page.getByRole('button', { name: 'Đến lượt bạn', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nghe mẫu', exact: true })).toBeEnabled()
})

test('real capture-worklet-worker path stores insufficient fake microphone result', async ({
  page,
}) => {
  await page.goto('./#/san-dinh')
  await page.getByRole('button', { name: 'Đến lượt bạn', exact: true }).click()
  await expect(page.getByText('Đã lưu kết quả trên máy', { exact: true })).toBeVisible({
    timeout: 25000,
  })
  await page.getByRole('link', { name: 'Xem tiến bộ', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.getByText('Trên máy', { exact: true })).toBeVisible()
})

test('verified offline package includes lazy 3D, worker, sources and class', async ({
  page,
  context,
}) => {
  await page.goto('./#/cai-dat')
  await page.getByRole('button', { name: 'Chuẩn bị demo offline' }).click()
  await expect(page.getByText(/Đã xác minh đủ tài nguyên/)).toBeVisible({ timeout: 40000 })
  await context.setOffline(true)
  await page.goto('./#/giao-vien')
  await expect(page.locator('tbody tr')).toHaveCount(30)
  await page.goto('./#/san-dinh')
  await expect(page.getByRole('button', { name: 'Nghe mẫu', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Đến lượt bạn', exact: true }).click()
  await expect(page.getByText('Đã lưu kết quả trên máy', { exact: true })).toBeVisible({
    timeout: 25000,
  })
})

for (const width of [360, 390, 768, 1024, 1440])
  test(`no document overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 })
    for (const path of [
      '',
      'kham-pha',
      'chuan-bi',
      'san-dinh',
      'tien-bo',
      'giao-vien',
      'cai-dat',
    ]) {
      await page.goto(`./#/${path}`)
      await page.locator('h1').waitFor()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, `Route ${path}`).toBeLessThanOrEqual(1)
    }
  })

test('keyboard skip link, mobile drawer and accessibility checks', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page.getByRole('heading', { name: /Giữ một nhịp Xoan/ })).toBeVisible()
  for (const path of ['', 'kham-pha', 'chuan-bi', 'tien-bo', 'giao-vien', 'cai-dat']) {
    await page.goto(`./#/${path}`)
    await page.locator('h1').waitFor()
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      path,
    ).toEqual([])
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('aside.sidebar')).toHaveAttribute('inert', '')
  await page.getByRole('button', { name: 'Mở menu', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Trang chủ', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('aside.sidebar')).toHaveAttribute('inert', '')
})
