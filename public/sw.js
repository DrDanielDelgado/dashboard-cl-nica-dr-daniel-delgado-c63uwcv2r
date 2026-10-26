// Service Worker para Web Push Notifications - Clínica Dr. Daniel Delgado

self.addEventListener('push', (event) => {
  let data = {
    title: 'Clínica Dr. Daniel Delgado',
    body: 'Nova atualização sobre seus agendamentos e saúde vascular.',
    url: '/agenda',
  }

  if (event.data) {
    try {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    } catch (_) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    }),
  )
})
