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

	//sent email

	document.querySelector('#compose-submit').onclick = () => {
		// TODO obsługa bledu gdy odbiorca meilu nie istnieje
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
				// Print result
				console.log(result);
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
		element.className = 'email email-id';
		element.dataset.id = email.id;
		emailHTML = `
      <div class="flex-column" >
        <div class="subject">Title: ${email.subject}</div>`;

		//if user is sender display recipients or vice versa
		if (email.user == email.sender) {
			emailHTML += `<div class="recipients">To: ${email.recipients}</div>`;
		} else {
			emailHTML += `<div class="sender">From: ${email.sender}</div>`;
		}

		emailHTML += ` 
      </div>
      <div class="flex-column">
        <div class="timestamp">${email.timestamp}</div>
        <div class="flex">`;

		if (mailbox != 'archive') {
			emailHTML += `<img class="icon icon-archive" src="https://cdn-icons-png.flaticon.com/512/2891/2891491.png" alt="" />`;
		} else {
			emailHTML += `<img class="icon icon-unArchive" src="https://static.thenounproject.com/png/829241-200.png" alt="" />`;
		}

		emailHTML += `
        <div class="reply">`;

		if (email.user != email.sender) {
			emailHTML += `
				<img class="icon icon-reply" src="https://cdn-icons-png.flaticon.com/512/624/624980.png" alt="" />`;
		}

		emailHTML += `
        </div>
      </div>
    </div>`;
		element.innerHTML = emailHTML;
		element.addEventListener('click', popup);

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
function popup(event) {
	const emailShow = document.querySelector('#email-show');
	const emailShowWraper = document.querySelector('#email-show-wraper');

	emailShow.style.display = 'flex';
	load_data(event);
	emailShow.addEventListener('click', () => {
		emailShow.style.display = 'none';
		console.log(event);
	});

	//if you click on a mail popup still will be displayed
	emailShowWraper.addEventListener('click', (e) => {
		e.stopPropagation();
	});
}

//load data to popup
function load_data(event) {
	idEvent = event.target.dataset.id;
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

	load_mailbox('inbox');
}

function iconReply(e) {
	e.stopPropagation();
	id = e.target.closest('.email-id').dataset.id;

	fetch(`/emails/${id}`).then((response) => response.json()).then((email) => {
		let subject = `Re: ${email.subject}`;
		let body = `On ${email.timestamp} ${email.sender} Wrote: ${email.body}`;
		compose_email(e, email.sender, subject, body);
	});
}

//todo:
// -archiwizacja
// -poprawic by butonow odpowiedzi nie bylo w wylanych bo bez sensu
// -czy email zostal przeczytany zmiana tla
// -walidacja formularza i wyswietlanie bledow
