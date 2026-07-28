self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "MedLembre", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "MedLembre", {
      body: payload.body ?? "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { medicationId: payload.medicationId ?? null },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/dashboard");
    }),
  );
});
