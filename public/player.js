window.addEventListener("message", receiveMessage, false);
const muffin_player_div = document.getElementById("muffin_player_div")

function receiveMessage(event) {
	muffin_player_div.style.height = event.data.height + "px";
}