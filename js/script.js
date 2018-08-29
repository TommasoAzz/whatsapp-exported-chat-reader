function createMessageSent(message) {
	const tick = 	"<span class='tick'>" +
						"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='15' id='msg-dblcheck-ack' x='2063' y='2076'>" +
							"<path d='M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z' fill='#4fc3f7' />" +
						"</svg>" +
					"</span>";
	
	let htmlMsg = 	"<div class='message sent'>" +
						message.content +
						"<span class='metadata'>" +
							"<span class='time'>" + message.time + "</span>" +
							tick +
						"</span>" +
					"</div>";

	return htmlMsg;
}

function createMessageReceived(message) {
	let htmlMsg = 	"<div class='message received'>" +
						message.content +
						"<span class='metadata'>" +
							"<span class='time'>" + message.time + "</span>" +
						"</span>" +
					"</div>";

	return htmlMsg;
}

function setDeviceTime($deviceTime) {
	$deviceTime.text(moment().format('LT'));
}

function getMessages() {
	var $conversation = $('div.conversation-container');

	const requestParametres = {
		id_conversation: id_conversation,
		beginDate: beginDate,
		endDate: endDate,
		id_sender: id_sender,
		id_receiver: id_receiver
	};

	$.post("/scripts/getMessages.php", requestParametres, function(result) {

	});
}

function getReceiver(id_conversation,id_sender) {
	var $receiverName = $("div.user-bar div.name span#profileName");
	var $receiverStatus = $("div.user-bar div.name span.status");
	var $receiverPic = $("div.user-bar div.avatar img#profilePic");

	const requestParametres = {
		id_conversation: id_conversation,
		id_sender: id_sender
	};

	$.post("/scripts/getReceiver.php", requestParametres, function(result) {
		
	});
}

$(document).ready(function() {
	//page elements
	var $deviceTime = $("div.status-bar div.time");
	var $messageTime = $("div.message div.time");
	var $form = $('div.conversation-compose');
	var $conversation = $('div.conversation-container');

	/* TIME */
	window.setInterval(function() {
		setDeviceTime($deviceTime);
	}, 1000);

	/* USER BAR */
	getReceiver(1,2);

});