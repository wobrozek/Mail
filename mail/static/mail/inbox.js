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

		load(emails);
	});
}

//show emails in inbox
function load(emails) {
	for (email of emails) {
		const element = document.createElement('div');
		element.className = 'email email-id';
		element.dataset.id = email.id;
		element.innerHTML = `
      <div class="flex-column" >
        <div class="subject">Title: ${email.subject}</div>
        <div class="sender">From: ${email.sender}</div>
      </div>

      <div class="flex-column">
        <div class="timestamp">${email.timestamp}</div>
        <div class="flex">
          <div class="archive">
            <img class="icon icon-trash" src="https://cdn-icons-png.flaticon.com/512/2891/2891491.png" alt="" />
          </div>
          <div class="reply">
            <img  class="icon icon-reply" src="https://cdn-icons-png.flaticon.com/512/624/624980.png" alt="" />
          </div>
        </div>
      </div>`;

		element.addEventListener('click', popup);

		document.querySelector('#emails-view').append(element);
	}
	// add onclick to all buttons
	document.querySelectorAll('.icon-reply').forEach(function(icon) {
		icon.addEventListener('click', iconReply);
	});

	document.querySelectorAll('.icon-trash').forEach(function(icon) {
		icon.onclick = iconDelete;
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

function iconDelete(e) {
	e.stopPropagation();
	id = e.target.closest('.email-id').dataset.id;
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
// -czy emial zostal przeczytany zmiana tla
// -walidacja formularza i wyswietlanie bledow
