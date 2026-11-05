/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  matchPrecache,
  getCacheKeyForURL,
} from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}
const manifest = self.__WB_MANIFEST
precacheAndRoute(manifest)
cleanupOutdatedCaches()
clientsClaim()
registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' &&
    url.origin === self.location.origin &&
    url.pathname.startsWith(new URL(self.registration.scope).pathname),
  async () =>
    (await matchPrecache('index.html')) || fetch(new URL('index.html', self.registration.scope)),
)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
  if (event.data?.type === 'VERIFY_OFFLINE') {
    event.waitUntil(
      (async () => {
        let ok = true
        for (const item of manifest) {
          const key = getCacheKeyForURL(new URL(item.url, self.registration.scope).href)
          if (!key || !(await caches.match(key))) {
            ok = false
            break
          }
        }
        event.ports[0]?.postMessage({ ok, count: manifest.length })
      })(),
    )
  }
})
