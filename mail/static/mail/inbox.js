document.addEventListener('DOMContentLoaded', function() {
	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

	// By default, load the inbox
	load_mailbox('inbox');
});

function compose_email() {
	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = '';
	document.querySelector('#compose-subject').value = '';
	document.querySelector('#compose-body').value = '';

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

function load(emails) {
	for (email of emails) {
		const element = document.createElement('div');
		element.className = 'email';
		element.id = email.id;
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

function load_data(event) {
	id = event.target.id;
	fetch(`/emails/${id}`).then((response) => response.json()).then((email) => {
		document.querySelectorAll('.data').forEach((element) => {
			element.innerHTML = email[element.dataset.email];
		});
	});
}
