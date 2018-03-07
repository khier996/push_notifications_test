// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require turbolinks
//= require_tree .
//= require jquery
//= require jquery_ujs



$(document).ready(register)

function register() {
  if (navigator.serviceWorker) {
    console.log('Registering serviceworker');
    navigator.serviceWorker.register('/serviceworker.js')
    .then(function(reg) {
      console.log('Service worker change, registered the service worker', reg);
    })
    .then(() => ask_user_permission())
  }
  else {
    console.error('Service worker is not supported in this browser');
  }
}

function ask_user_permission() {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        console.log('Permission to receive notifications granted!');
        subscribe();
      }
    });
  } else {
    console.log('Permission to receive notifications granted!');
    subscribe();
  }
}


function subscribe() {
  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    const pushManager = serviceWorkerRegistration.pushManager
    pushManager.getSubscription()
    .then((subscription) => {
      if (subscription) {
        refreshSubscription(pushManager, subscription);
      } else {
        pushManagerSubscribe(pushManager);
      }
    })
  });
}

function refreshSubscription(pushManager, subscription) {
  console.log('Refreshing subscription');
  fetch("/delete_subscription", {
    headers: formHeaders(),
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ subscription: subscription.toJSON() })
  })
  subscription.unsubscribe().then((bool) => {
    pushManagerSubscribe(pushManager);
  });
}

function pushManagerSubscribe(pushManager) {
  console.log('Subscribing started...');

  pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: window.publicKey
  })
  .then((subscription) => {
    fetch("/send_to_db", {
      headers: formHeaders(),
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ subscription: subscription.toJSON() })
    })
  })
  .then(() => { console.log('Subcribing finished: success!')})
  .catch((e) => {
    if (Notification.permission === 'denied') {
      console.log('Permission to send notifications denied');
    } else {
      console.log('Unable to subscribe to push', e);
    }
  });
}

/////////////////////////////////////////////////////////////

function sendNotification() {
  console.log('Start sending notification...')
  getSubscription().then((subscription) => {
    return fetch("/push", {
      headers: formHeaders(),
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ subscription: subscription.toJSON() })
    }).then((response) => {
      console.log("Push response", response);
      if (response.status >= 500) {
        console.log(response.statusText);
        alert("Sorry, there was a problem sending the notification. Try resubscribing to push messages and resending.");
      }
    })
    .catch((e) => {
      console.log("Error sending notification", e);
    });
  })
}

function getSubscription() {
  return navigator.serviceWorker.ready
  .then((serviceWorkerRegistration) => {
    return serviceWorkerRegistration.pushManager.getSubscription()
    .catch((error) => {
      console.log('Error during getSubscription()', error);
    });
  });
}

function formHeaders() {
  return new Headers({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': authenticityToken()
  });
}

function authenticityToken() {
  return document.querySelector('meta[name=csrf-token]').content;
}


$(document).ready(function() {
  $('.webpush-button').on('click', (e) => {
    sendNotification()
  });
})



//= require serviceworker-companion
