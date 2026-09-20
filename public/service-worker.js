// Minimal service worker. It exists only to satisfy Chrome's PWA
// installability criteria (a registered service worker with a `fetch`
// handler) -- it does not cache anything or provide offline support.
// Every request just passes straight through to the network unchanged.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
