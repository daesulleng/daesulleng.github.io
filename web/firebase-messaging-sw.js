// Install before Firebase's default click listener. Route only an opaque ID to
// this app; never follow an fcmOptions.link, URL, or target from push data.
self.addEventListener('notificationclick', (event) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const payload = event.notification.data;
  const data = payload && (payload.FCM_MSG ? payload.FCM_MSG.data : payload);
  const id = data && data.notification_id;
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) return;
  const url = new URL('./', self.location.href);
  url.searchParams.set('notification', id);
  event.waitUntil((async () => {
    let clients = [];
    try { clients = await self.clients.matchAll({type:'window',includeUncontrolled:true}); } catch (_) {}
    for (const client of clients) {
      let current;
      try { current = new URL(client.url); } catch (_) { continue; }
      if (current.origin !== url.origin || !current.pathname.startsWith(url.pathname)) continue;
      try {
        const navigated = await client.navigate(url.href);
        if (navigated) return await navigated.focus();
      } catch (_) { /* A tab may have closed since matchAll; try another tab. */ }
    }
    return self.clients.openWindow(url.href);
  })());
});
importScripts('./firebase-config.js');
const config = self.daesullaengFirebaseConfig;
if (config && ['apiKey','appId','projectId','messagingSenderId'].every((key) =>
    typeof config[key] === 'string' && config[key].trim().length > 0)) {
  importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');
  firebase.initializeApp(config);
  // FCM displays notification payloads itself. No showNotification here: doing
  // that as well would display the same event twice.
  firebase.messaging();
}
