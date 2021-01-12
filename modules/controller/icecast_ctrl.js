const icecast = require("../icecast")

module.exports = {
	new_request: (request) => {
		if (!originIsAllowed(request.origin)) {
			request.reject();
			console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
			return;
		}


		var connection = request.accept('live', request.origin);

		icecast.connections.push(connection);
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' connected.');

		if (icecast.stream_data !== undefined) {
			connection.sendUTF(JSON.stringify(icecast.stream_data));
		}

		connection.on('close', function (reasonCode, description) {
			removeA(icecast.connections, connection)
			console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		});
	}

}

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}