type PermissionOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>
}
export function hasOrientationData(
  event: Pick<DeviceOrientationEvent, 'alpha' | 'beta' | 'gamma'>,
) {
  return [event.alpha, event.beta, event.gamma].every(
    (value) => typeof value === 'number' && Number.isFinite(value),
  )
}
export function screenAngle(): number {
  // Older iOS Safari exposes window.orientation instead of ScreenOrientation.
  const legacy = (window as Window & { orientation?: number }).orientation
  return window.screen.orientation?.angle ?? (typeof legacy === 'number' ? legacy : 0)
}
export async function requestSensors(): Promise<boolean> {
  const orientation = window.DeviceOrientationEvent as PermissionOrientation | undefined
  if (!orientation) return false
  if (orientation.requestPermission && (await orientation.requestPermission()) !== 'granted')
    return false
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      window.removeEventListener('deviceorientation', received)
      resolve(false)
    }, 3500)
    const received = (event: DeviceOrientationEvent) => {
      if (!hasOrientationData(event)) return
      clearTimeout(timer)
      window.removeEventListener('deviceorientation', received)
      resolve(true)
    }
    window.addEventListener('deviceorientation', received)
  })
}
