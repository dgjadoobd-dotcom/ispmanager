// Service Worker for Push Notifications

// Listen for push events
self.addEventListener("push", function (event) {
  console.log("[SW] Push received:", event);

  let data = {
    title: "NetPulse ISP",
    body: "আপনার একটি নতুন নোটিফিকেশন আছে",
    icon: "/pwa-icons/icon-192x192.png",
    badge: "/pwa-icons/icon-72x72.png",
    data: { url: "/app" },
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        data: payload.data || data.data,
      };
    }
  } catch (e) {
    console.error("[SW] Error parsing push data:", e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: "open",
        title: "দেখুন",
      },
      {
        action: "close",
        title: "বন্ধ করুন",
      },
    ],
    tag: data.data?.type || "general",
    renotify: true,
    requireInteraction: data.data?.type === "billing_reminder",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  console.log("[SW] Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/app";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      // Open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle subscription change
self.addEventListener("pushsubscriptionchange", function (event) {
  console.log("[SW] Push subscription changed:", event);

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .then(function (subscription) {
        console.log("[SW] Re-subscribed:", subscription);
        // The app will need to update the backend with the new subscription
      })
      .catch(function (error) {
        console.error("[SW] Re-subscription failed:", error);
      })
  );
});
