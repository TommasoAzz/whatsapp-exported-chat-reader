function $alert(titolo, contenuto) {
    if(titolo.length > 0 || contenuto.length > 0) {
        $.alert({
            escapeKey: true,
            backgroundDismiss: true,
            theme: "modern",
            title: titolo,
            content: contenuto
        });
    }
}

function remove_non_ascii(str) {
	if (str === null || str === "" ) return false;

	str = str.toString();

	return str.replace(/[^\x20-\x7E]/g, '').trim();
}

function prepareMediaElement(message,id_conversation) {
	const mediaType = parseInt(message.content_type);
	if(mediaType === 1) return message.content;
	
	var fileName = message.content;
	
	//removing the whatsapp words to say the content is a file
	fileName = remove_non_ascii(fileName.replace("<allegato>","").replace("<allegato:","").replace(">","").replace("(file allegato)",""));

	switch(mediaType) {
		case 2: //image
			message.content = "<img class='img-fluid' src='files/conversation" + id_conversation + "/" + fileName + "' alt='Filename: " + fileName + "' />"; 
			break;
		case 3: //video
			message.content = "<div class='embed-responsive-item'><video controls><source src='files/conversation" + id_conversation + "/" + fileName + "' type='video/mp4'>Filename: " + fileName + "</video></div>"; 
			break;
		case 4: //audio
			message.content = "<div class='embed-responsive-item'><audio controls><source src='files/conversation" + id_conversation + "/" + fileName + "' type='audio/ogg; codecs=opus'>Filename: " + fileName + "</audio></div>"
			break;
	}

	return message.content;
}

function createMessageSent(message,id_conversation) {
	const tick = 	"<span class='tick'>" +
						"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='15' id='msg-dblcheck-ack' x='2063' y='2076'>" +
							"<path d='M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z' fill='#4fc3f7' />" +
						"</svg>" +
					"</span>";
	
	let htmlMsg = 	"<div class='message sent'>" +
						prepareMediaElement(message,id_conversation) +
						"<span class='metadata'>" +
							"<span class='time'>" + moment(message.time,"HH:mm:ss").format("HH:mm") + "</span>" +
							tick +
						"</span>" +
					"</div>";

	return htmlMsg;
}

function createMessageReceived(message,id_conversation) {
	let htmlMsg = 	"<div class='message received'>" +
						prepareMediaElement(message,id_conversation) +
						"<span class='metadata'>" +
							"<span class='time'>" + moment(message.time,"HH:mm:ss").format("HH:mm") + "</span>" +
						"</span>" +
					"</div>";

	return htmlMsg;
}

function setTime($element) {
	$element.text(moment().format("HH:mm"));
}

function appendMessageToChat(htmlMessage) {
	const $conversation = $('div.conversation-container');
	
	$conversation.append(htmlMessage);
}
function getMessages(id_conversation,beginDate,endDate,id_sender,id_receiver) {
	
	const requestParametres = {
		id_conversation: id_conversation,
		beginDate: beginDate,
		endDate: endDate,
		id_sender: id_sender,
		id_receiver: id_receiver
	};

	$.post("/scripts/getMessages.php", requestParametres, function(result) {
		if(result.trim() === "error_messages") {
			let title = "Attention", content = "There was an error loading the messages you required. Reload the page to try again.";
			$alert(title,content);
		} else {
			messages = $.parseJSON(result.trim());
			for(let i = 0, l=messages.length; i<l; i++) {
				var htmlMessage = "";
				if(id_sender == messages[i].id_sender) {
					htmlMessage = createMessageSent(messages[i],id_conversation);
				} else {
					htmlMessage = createMessageReceived(messages[i],id_conversation);
				}
				appendMessageToChat(htmlMessage);
			}
		}
	});
}

function getReceiver(id_receiver) {
	var $receiverName = $("div.user-bar div.name span#profileName");
	var $receiverStatus = $("div.user-bar div.name span.status");
	var $receiverPic = $("div.user-bar div.avatar img#profilePic");

	const requestParametres = {
		id_receiver: id_receiver
	};

	$.post("/scripts/getReceiver.php", requestParametres, function(result) {
		if(result.trim() === "error_receiver_data") {
			let title = "Attention", content = "There was an error loading the receiver data. Reload the page to try again.";
			$alert(title,content);
		} else {
			profileData = $.parseJSON(result.trim());
			$receiverName.text(profileData.name);
			$receiverStatus.text("online");
			$receiverPic.attr("src","/img/profile_pics/" + profileData.profile_pic);
		}
	});
}

function datePrompt(id_conversation,id_sender,id_receiver) {
	const requestParametres = {
		id_conversation: id_conversation
	}

	$.post("/scripts/getDates.php",requestParametres,function(result) {
		var minDate = "", maxDate = "";
		if(result.trim() === "error_dates") {
			let title = "Attention", content="There was an error loading the least and most recent dates for this conversation. Reload the page to try again.";
			$alert(title,content);	
		} else {
			dates = $.parseJSON(result.trim());
			minDate = dates.min_date;
			maxDate = dates.max_date;
		}

		$.confirm({
			escapeKey: true,
			backgroundDismiss: true,
			theme: "modern",
			title: "Action required to continue",
			content: "<form id='promptBeginEndDates'><div class='form-group'>" +
					 "<label style='text-align:justify'>The messages sent and received in this conversation are too many to be loaded at once. " +
					 "Please select the period of time of which you want to load messages, then press Submit.</label>" +
					 "<label>Begin date: </label>" +
					 "<input type='date' class='form-control' id='beginDate' min='" + minDate + "' max='" + maxDate + "' required />" +
					 "<label>End date: </label>" +
					 "<input type='date' class='form-control' id='endDate' min='" + minDate + "' max='" + maxDate + "' required />" +
					 "</div></form>",
			buttons: {
				formSubmit: {
					text: 'Submit',
					btnClass: 'btn-success',
					action: function() {
						const beginDate=this.$content.find('input#beginDate').val();
						const endDate=this.$content.find('input#endDate').val();
						if(!beginDate) {
							let title="Attention",content="Insert the begin date or press Cancel.";
							$alert(title,content);
							return false;
						} else if(!endDate) {
							let title="Attention",content="Insert the end date or press Cancel.";
							$alert(title,content);
							return false;
						} else if(beginDate > endDate) {
							let title="Error",content="The end date must be after the begin date!";
							$alert(title,content);
							return false;
						} else {
							getMessages(id_conversation,beginDate,endDate,id_sender,id_receiver);
						}
					}
				},
				cancel: {
					text: "Cancel",
					btnClass: "btn-danger"
				}
			},
			onContentReady: function() {
				var prompt = this;
				this.$content.find('form').on('submit', function(e) {
					e.preventDefault();
					prompt.$$formSubmit.trigger('click');
				});
			}
		});
	});
}

function changeChat(id_conversation,id_sender,id_receiver) {

}

function switchReader(id_sender,id_receiver) {

}

$(document).ready(function() {
	//page elements
	var $deviceTime = $("div.status-bar div.time");
	var $loadButtonTime = $("div#loadButton div.time");
	var $form = $('div.conversation-compose');
	var $conversation = $('div.conversation-container');

	//variables
	var id_conversation = 1;
	var id_sender = 2;
	var id_receiver = 1;

	/* TIME */
	window.setInterval(function() {
		setTime($deviceTime);
		setTime($loadButtonTime);
	}, 1000);

	/* USER BAR */
	getReceiver(id_receiver);

	/* BEGIN AND END DATE FIRST PROMPT */
	datePrompt(id_conversation,id_sender,id_receiver);

	/* EVENT MANAGER */
	$("div.back a#btnChangeChat").click(function() {
		changeChat(id_conversation,id_sender,id_receiver);
	});

	$("div#loadButton a#btnSwitchReader").click(function() {
		switchReader(id_sender,id_receiver);
	});

	$("div#loadButton a#btnLoadMessages").click(function() {
		datePrompt(id_conversation,id_sender,id_receiver);
	});

});