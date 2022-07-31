document.addEventListener('DOMContentLoaded', function() {
	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

	// By default, load the inbox
	load_mailbox('inbox');
});

function compose_email(e, recipients = '', subject = '', body = '') {
	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#email-show').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = recipients;
	document.querySelector('#compose-subject').value = subject;
	document.querySelector('#compose-body').value = body;
	document.querySelector('#invalid-recipients').style.display = 'none';
	document.querySelector('#empty-recipients').style.display = 'none';

	//sent email

	document.querySelector('#compose-submit').onclick = (e) => {
		e.preventDefault();
		fetch('/emails', {
			method: 'POST',
			body: JSON.stringify({
				recipients: document.querySelector('#compose-recipients').value,
				subject: document.querySelector('#compose-subject').value,
				body: document.querySelector('#compose-body').value
			})
		})
			.then((response) => response.json())
			.then((result) => {
				console.log(result.message);
				if (result.message == 'Email sent successfully.') {
					load_mailbox('sent');
				} else {
					if (document.querySelector('#compose-recipients').value == '') {
						document.querySelector('#empty-recipients').style.display = 'block';
						document.querySelector('#invalid-recipients').style.display = 'none';
					} else {
						document.querySelector('#invalid-recipients').style.display = 'block';
						document.querySelector('#empty-recipients').style.display = 'none';
					}
				}
			});
	};
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	//load all mails
	fetch(`/emails/${mailbox}`).then((response) => response.json()).then((emails) => {
		console.log(emails);

		load(emails, mailbox);
	});
}

//show emails in inbox
function load(emails, mailbox) {
	for (email of emails) {
		const element = document.createElement('div');
		const curentUser = document.querySelector('#compose-user').value;
		element.className = 'email email-id';
		element.id = `email${email.id}`;
		if (email.read) {
			element.classList.add('email-read');
		}
		element.dataset.id = email.id;
		var emailHTML = `
      <div class="flex-column" >
        <div class="subject">Title: ${email.subject}</div>`;

		//if user is sender display recipients or vice versa
		if (curentUser == email.sender) {
			emailHTML += `<div class="recipients">To: ${email.recipients}</div>`;
		} else {
			emailHTML += `<div class="sender">From: ${email.sender}</div>`;
		}

		emailHTML += ` 
      </div>
      <div class="flex-column">
        <div class="timestamp">${email.timestamp}</div>
        <div class="flex">`;

		emailHTML += buttonsHTML(mailbox);

		emailHTML += `
        </div>
      </div>
    </div>`;
		element.innerHTML = emailHTML;
		element.addEventListener('click', (e) => popup(e, mailbox));

		document.querySelector('#emails-view').append(element);
	}

	// add onclick to all buttons

	document.querySelectorAll('.icon-reply').forEach(function(icon) {
		icon.addEventListener('click', iconReply);
	});

	document.querySelectorAll('.icon-archive').forEach(function(icon) {
		icon.onclick = (e) => iconArchive(e, true);
	});

	document.querySelectorAll('.icon-unArchive').forEach(function(icon) {
		icon.onclick = (e) => iconArchive(e, false);
	});
}
//schow email after onclick
function popup(event, mailbox) {
	const emailShow = document.querySelector('#email-show');
	const emailShowWraper = document.querySelector('#email-show-wraper');

	emailShow.style.display = 'flex';
	load_data(event);

	//create butons and add listeners
	document.querySelector('#email-buttons').innerHTML = buttonsHTML(mailbox);

	var replyButton = document.querySelectorAll('#email-buttons .icon-reply');
	var archiveButton = document.querySelectorAll('#email-buttons .icon-archive');
	var unArchiveButton = document.querySelectorAll('#email-buttons .icon-unArchive');

	if (replyButton[0] != null) {
		replyButton[0].onclick = iconReply;
	}

	if (archiveButton[0] != null) {
		archiveButton[0].onclick = (e) => iconArchive(e, true);
	}

	if (unArchiveButton[0] != null) {
		unArchiveButton[0].onclick = (e) => iconArchive(e, false);
	}

	emailShow.addEventListener('click', () => {
		emailShow.style.display = 'none';
		console.log(event);
	});

	//if you click on a mail popup still will be displayed
	emailShowWraper.addEventListener('click', (e) => {
		e.stopPropagation();
	});

	//mark mail as read
	fetch(`/emails/${event.target.dataset.id}`, {
		method: 'PUT',
		body: JSON.stringify({
			read: true
		})
	})
		.then((response) => response.json())
		.then((result) => {
			// Print result
			console.log(result);
		});

	event.target.classList.add('email-read');
}

//load data to popup
function load_data(event) {
	idEvent = event.target.closest('.email-id').dataset.id;
	document.querySelector('#email-show').dataset.id = idEvent;
	fetch(`/emails/${idEvent}`).then((response) => response.json()).then((email) => {
		document.querySelectorAll('.data').forEach((element) => {
			element.innerHTML = email[element.dataset.email];
		});
	});
}

//buttons

//use true to archive or false to unArchive
function iconArchive(e, bool) {
	e.stopPropagation();
	id = e.target.closest('.email-id').dataset.id;

	fetch(`/emails/${id}`, {
		method: 'PUT',
		body: JSON.stringify({
			archived: bool
		})
	})
		.then((response) => response.json())
		.then((result) => {
			// Print result
			console.log(result);
		});

	document.querySelector('#email-show').style.display = 'none';
	var mail = document.querySelector(`#email${id}`);
	mail.style.animationPlayState = 'Running';
	mail.addEventListener('animationend', () => {
		mail.remove();
	});
}

function iconReply(e) {
	console.log('kliknieto przycisk');
	e.stopPropagation();
	id = e.target.closest('.email-id').dataset.id;

	fetch(`/emails/${id}`).then((response) => response.json()).then((email) => {
		let subject = `Re: ${email.subject}`;
		let body = `On ${email.timestamp} ${email.sender} Wrote: ${email.body}`;
		compose_email(e, email.sender, subject, body);
	});
}

//print archive and reply buttons
function buttonsHTML(mailbox) {
	var buttonsHTML = '';
	if (mailbox == 'sent') {
		buttonsHTML = '';
	}

	if (mailbox == 'archive') {
		buttonsHTML = `<img class="icon icon-unArchive" src="https://static.thenounproject.com/png/829241-200.png" alt="" />
			<img class="icon icon-reply" src="https://cdn-icons-png.flaticon.com/512/624/624980.png" alt="" />`;
	}

	if (mailbox == 'inbox') {
		buttonsHTML = `<img class="icon icon-archive" src="https://cdn-icons-png.flaticon.com/512/2891/2891491.png" alt="" />
			<img class="icon icon-reply" src="https://cdn-icons-png.flaticon.com/512/624/624980.png" alt="" />`;
	}

	return buttonsHTML;
}

//todo:
// -szybkie klikniecia powoduja stakowanie meili
// -wyglad
// -read me
