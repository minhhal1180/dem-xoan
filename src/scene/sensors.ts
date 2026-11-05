type PermissionOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>
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
      if (event.alpha === null || event.beta === null || event.gamma === null) return
      clearTimeout(timer)
      window.removeEventListener('deviceorientation', received)
      resolve(true)
    }
    window.addEventListener('deviceorientation', received)
  })
}
