self.addEventListener('push', function(event) {
  console.log('Received a push message', event);

  var data = JSON.parse(event.data.text());
  var title = data['title'];
  var body = data['body'];
  var icon = data['icon'];

  event.waitUntil(
    self.registration.showNotification(title, {
      data: data,
      body: body,
      icon: icon,
    })
  );
});

function onPushSubscriptionChange(event) {
  console.log("Push subscription change event detected", event);
}

self.addEventListener('notificationclick', function(event) {
  console.log('click event', event)
  var data = event.notification.data
  var url = data['url'];
  event.notification.close(); // Android needs explicit close.
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
      if (clients.openWindow) {
          return clients.openWindow(url);
      }
    })
  );
});



// self.addEventListener("pushsubscriptionchange", onPushSubscriptionChange);
