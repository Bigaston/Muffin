/* eslint-disable no-undef */
let base_url = "";
if (this.location.hostname === "localhost") {
	base_url = "http://localhost:6935";
}

const urlB64ToUint8Array = base64String => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}

this.addEventListener('activate', () => {
	console.log('service worker sub activé')

	fetch(base_url + "/api/push/vapid")
		.then(res => {
			if (res.ok) return res.text();
		}).then(key => {
			const options = {
				userVisibleOnly: true,
				applicationServerKey: urlB64ToUint8Array(key)
			}
			this.registration.pushManager.subscribe(options).then(subscription => {
				fetch(base_url + "/api/push/save", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(subscription),
				}).then(res => {
				})
			})
		})
})

this.addEventListener('push', function (event) {
	if (event.data) {
		let ep = event.data.json();
		this.registration.showNotification(ep.title, {
			"body": ep.desc,
			"icon": base_url + ep.img,
			"data": { url: ep.url }
		})
	} else {
		console.log("Push event but no data");
	}
})

this.addEventListener("notificationclick", function (event) {
	event.notification.close();

	event.waitUntil(clients.matchAll({
		type: "window"
	}).then(function (clientList) {
		for (var i = 0; i < clientList.length; i++) {
			var client = clientList[i];
			if (client.url === event.notification.data.url && 'focus' in client)
				return client.focus();
		}
		if (clients.openWindow)
			return clients.openWindow(event.notification.data.url);
	}));
})