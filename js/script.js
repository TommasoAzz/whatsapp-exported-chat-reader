function setCookie(cName,cVal,days) {
    var d = new Date();
	d.setTime(d.getTime() + (days*24*60*60*1000));
	
    const expires = "expires="+ d.toUTCString();
    document.cookie = cName + "=" + cVal + ";" + expires + ";path=/";
} //creates a new cookie

function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
	const cookie_parts = decodedCookie.split(";");
	
    for(let i = 0, l = cookie_parts.length; i < l; i++) {
		let part = cookie_parts[i];
		
		while(part.charAt(0) == ' ') part = part.substring(1);
		
        if(part.indexOf(name) === 0) return part.substring(name.length,part.length);
	}
	
    return "";
} //returns the value of the cookie

function $alert(title, content) {
    if(title.length > 0 || content.length > 0) {
        $.alert({
            escapeKey: true,
            backgroundDismiss: true,
            theme: "modern",
            title: title,
            content: content
        });
    }
} //popup alert that shows an error or an info message

function remove_non_ascii(str) {
	if (str === null || str === "" ) return false;

	str = str.toString();

	return str.replace(/[^\x20-\x7E]/g, '').trim();
} //remove non-ascii characters from str

function setTime($element) {
	$element.text(moment().format("HH:mm"));
} //sets the inner text of $element with current time in HH:mm format

function prepareContent(message, id_conversation) {
	const mediaType = parseInt(message.content_type);
	if(mediaType === 1) return message.content;
	
	var fileName = message.content;
	
	//removing the whatsapp words to say the content is a file
	fileName = remove_non_ascii(fileName.replace("<allegato>","").replace("<allegato:","").replace(">","").replace("(file allegato)",""));

	switch(mediaType) {
		case 2: //image
			message.content = "<img class='img-fluid' src='' data-original='files/conversation" + id_conversation + "/" + fileName + "' alt='Filename: " + fileName + "' />"; 
			break;
		case 3: //video
			message.content = "<video class='embed-responsive lazy' preload='auto' controls><source src='files/conversation" + id_conversation + "/" + fileName + "' type='video/mp4'>Filename: " + fileName + "</video>"; 
			break;
		case 4: //audio
			message.content = "<audio preload='auto' controls><source src='files/conversation" + id_conversation + "/" + fileName + "' type='audio/ogg'>Filename: " + fileName + "</audio></div>"
			break;
	}

	return message.content;
} //if message.content_type is 1 returns message.content otherwise it returns a media element as message.content

function createMessageSent(message, id_conversation) {
	const tick = 	"<span class='tick'>" +
						"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='15' id='msg-dblcheck-ack' x='2063' y='2076'>" +
							"<path d='M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z' fill='#4fc3f7' />" +
						"</svg>" +
					"</span>";
	
	let htmlMsg = 	"<div class='message sent'>" +
						prepareContent(message,id_conversation) +
						"<span class='metadata'>" +
							"<span class='time'>" + moment(message.time,"HH:mm:ss").format("HH:mm") + "</span>" +
							tick +
						"</span>" +
					"</div>";

	return htmlMsg;
} //creates a message on the right side of the screen (like if it was sent on the app WhatsApp)

function createMessageReceived(message, id_conversation) {
	let htmlMsg = 	"<div class='message received'>" +
						prepareContent(message,id_conversation) +
						"<span class='metadata'>" +
							"<span class='time'>" + moment(message.time,"HH:mm:ss").format("HH:mm") + "</span>" +
						"</span>" +
					"</div>";

	return htmlMsg;
} //creates a message on the left side of the screen (like if it was received on the app WhatsApp)

function appendMessageToChat(htmlMessage) {
	const $conversation = $('div.conversation-container');
	
	$conversation.append(htmlMessage);

	var myLazyLoad = new LazyLoad({
		elements_selector: "img",
		threshold: 200
	})
} //appends htmlMessage to div.conversation

function getMessages(id_conversation, beginDate, endDate, id_sender, id_receiver) {
	const $conversation = $('div.conversation-container');
	$conversation.html(""); //cleans the conversation on screen now

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
} //get the messages from mysql with the parametres passed to the function

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
} //get the info (name + profile pic) of the receiver contact

function datePrompt(id_conversation, id_sender, id_receiver) {
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
} //asks the user the time frame of which showing messages

function createConversationTable(data) {
	var table = "<div class='table-responsive'>" +
					"<table class='table table-hover'>" +
						"<thead>" +
							"<tr>" +
								"<th scope='col'>#</th>" +
								"<th scope='col'>Profile 1</th>" +
								"<th scope='col'>Profile 2</th>" +
								"<th scope='col'>Choose</th>" +
							"</tr>" +
						"</thead>" +
						"<tbody>";
	
	//creating table body and then table rows containing info on the conversation
	for(let i=0, l=data.length; i < l; i++) {
		table += "<tr>" +
					"<th scope='row'>" + data[i].id_conversation + "</th>" +
					"<td>" + data[i].participant1.name + "</td>" +
					"<td>" + data[i].participant2.name + "</td>" +
					"<td><input type='radio' name='btnConversation'" +
						"' value='" + data[i].id_conversation + "_" + data[i].participant1.id + "_" + data[i].participant2.id + "' /></td>"
				 "</tr>";
	}

	table +=			"</tbody>" +
					"</table>" +
				"</div>";
	
	return table;
} //output of the table with the list of conversations

function changeConversation() {
	$.post("/scripts/getConversations.php",function(result) {
		if(result.trim() === "error_conversations") {
			let title = "Attention", content = "There was an error loading the list of conversations. Reload the page to try again.";
			$alert(title,content);
		} else {
			var tableData = $.parseJSON(result.trim());
			$.confirm({
				escapeKey: true,
				backgroundDismiss: true,
				theme: "modern",
				title: "Select the conversation",
				content: "<form id='promptConversation'>" +
							"<div class='form-group'>" +
								"<label style='text-align:justify'>Click on the radio button to choose the conversation you want to open.</label>" +
								createConversationTable(tableData) + 
							"</div>",
				buttons: {
					formSubmit: {
						text: 'Continue',
						btnClass: 'btn-success',
						action: function() {
							var id_array = $('input[name=btnConversation]:checked', '#promptConversation').val().split("_");
							
							setCookie("id_conversation",id_array[0],1);
							setCookie("id_sender",id_array[1],1);
							setCookie("id_receiver",id_array[2],1);
							getReceiver(id_array[2]);
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
		}
	});
} //asks the user which conversation wants to be shown

function switchReader(id_sender, id_receiver) {
	var temp = id_receiver;
	id_receiver = id_sender;
	id_sender = temp;

	setCookie("id_sender",id_sender,1);
	setCookie("id_receiver",id_receiver,1);
	
	getReceiver(id_receiver);
} //asks the user which of the two persons involved into the conversation wants to be

function load_LazyLoad(w,d) {
	var b = d.getElementsByTagName('body')[0];
	var s = d.createElement("script"); 
	var v = !("IntersectionObserver" in w) ? "8.15.0" : "10.16.2";
	s.async = true; // This includes the script as async. See the "recipes" section for more information about async loading of LazyLoad.
	s.src = "https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/" + v + "/lazyload.min.js";
	w.lazyLoadOptions = {
		elements_selector: "img",
		threshold: 200
	};
	b.appendChild(s);
} //loads the best version of LazyLoad for the browser running the app

$(document).ready(function() {
	load_LazyLoad(window,document);

	//page elements
	var $deviceTime = $("div.status-bar div.time");
	var $loadButtonTime = $("div#loadButton div.time");
	var $btnSend = $("button.send");
	var $cmdInput = $("input.input-msg");
	//variables
	
	/* SETTING TIME & IDs*/
	setTime($loadButtonTime);
	window.setInterval(function() {
		setTime($deviceTime);
	}, 1000);

	/* MENU EVENT MANAGER */
	$btnSend.click(function() {
		const cmd = $cmdInput.val().trim().toLowerCase();
		$cmdInput.val("");

		if(cmd === "choose") {
			changeConversation();
		} else if(cmd === "switch") {
			let id_receiver = getCookie("id_receiver");
			let id_sender = getCookie("id_sender");
	
			switchReader(id_sender,id_receiver);
		} else if(cmd === "load") {
			let id_receiver = getCookie("id_receiver");
			let id_sender = getCookie("id_sender");
			let id_conversation = getCookie("id_conversation");

			datePrompt(id_conversation,id_sender,id_receiver);
		}
	});

	$cmdInput.keypress(function(e) {
        if(e.which == 13) $btnSend.trigger("click");
	});

});