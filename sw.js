// sw.js — Orom ilovasining Service Worker fayli.
// Bu fayl brauzer tomonidan alohida, fon rejimida ishga tushiriladi —
// hattoki ilova (sahifa) yopiq bo'lganda ham push xabarlarini qabul qiladi
// va OS bildirishnoma paneliga (Android/iOS) chiqaradi.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Backend "web-push" orqali yuborgan xabar shu yerda qabul qilinadi
self.addEventListener("push", (event) => {
  let data = { title: "Orom", body: "Yangi bildirishnoma", url: "/" };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (e) {
    // JSON bo'lmasa, matn sifatida olamiz
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233C4780'/%3E%3Ctext x='50' y='68' font-size='50' text-anchor='middle'%3E%F0%9F%8C%BF%3C/text%3E%3C/svg%3E",
    badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233C4780'/%3E%3C/svg%3E",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Foydalanuvchi bildirishnomani bosganda — ilovani ochadi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
