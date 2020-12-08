window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
	getFrameByEvent(event).style.height = event.data.height + "px";
}

function getFrameByEvent(event) {
	return [].slice.call(document.getElementsByTagName('iframe')).filter(function (iframe) {
		return iframe.contentWindow === event.source;
	})[0];
}