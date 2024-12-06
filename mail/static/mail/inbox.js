document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // Submit Mail Button 
    document.querySelector('#compose-form').addEventListener('submit', send_email);

    // By default, load the inboxs
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-view').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function view_email(id) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-view').style.display = 'block';



    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            console.log(email)

            document.getElementById('single-view').innerHTML = `
            <h3> Sender: ${email.sender} </h3>
            <h6> Recipients: ${email.recipients} </h6>
            <h6> Subject: ${email.subject} </h6>
            <p> Timestamp: ${email.timestamp} <p>
            <p> Body: ${email.body} <p>
            `

            if (email.archived === true) {
                const button = document.createElement('BUTTON');
                button.innerHTML = 'unarchive';
                button.id = 'unarchive';

                document.getElementById('single-view').appendChild(button);
                document.querySelector('#unarchive').addEventListener('click', () => {
                    fetch(`/emails/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            archived: false
                        })
                    })
                    load_mailbox('inbox');
                })
            } else if (email.archived === false) {
                const button = document.createElement('BUTTON');
                button.innerHTML = 'archive';
                button.id = 'archive';

                document.getElementById('single-view').appendChild(button);
                document.querySelector('#archive').addEventListener('click', () => {
                    fetch(`/emails/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            archived: true
                        })
                    })
                    load_mailbox('inbox');
                })
            }

            const reply = document.createElement('BUTTON');
            reply.id = 'reply-btn';
            reply.innerHTML = 'reply';
            document.getElementById('single-view').appendChild(reply);
            document.querySelector('#reply-btn').addEventListener('click', () => reply_email(id))
        })

    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })


}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            // Print emails
            console.log(emails)
            emails.forEach(element => {

                const outerdiv = document.createElement('div');
                outerdiv.id = `outerdiv${element.id}`;
                outerdiv.style.display = 'flex';
                outerdiv.style.justifyContent = 'space-between';



                const sender = document.createElement('div')
                sender.innerHTML = element.sender;
                sender.style.display = 'flex';

                const body = document.createElement('div')
                body.innerHTML = element.subject;
                body.style.display = 'flex';

                const timestamp = document.createElement('div')
                timestamp.innerHTML = element.timestamp;
                timestamp.style.display = 'flex';

                outerdiv.style.borderStyle = 'solid';
                outerdiv.style.width = '100%';
                outerdiv.style.marginBottom = '5px';

                outerdiv.appendChild(sender)
                outerdiv.appendChild(body)
                outerdiv.appendChild(timestamp)

                if (element.read === false) {
                    outerdiv.style.backgroundColor = 'grey';
                } else {
                    outerdiv.style.backgroundColor = 'white';
                }
                document.getElementById('emails-view').appendChild(outerdiv);

                document.querySelector(`#outerdiv${element.id}`).addEventListener('click', () => view_email(element.id));
            })

        });
}

function send_email(event) {
    event.preventDefault();

    fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            load_mailbox('sent');
        });

}

function reply_email(id) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-view').style.display = 'none';

    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            document.getElementById('compose-recipients').value = email.recipients;

            const string = email.subject;
            const substring = 'RE: '

            if (string.includes(substring)) {
                document.getElementById('compose-subject').value = email.subject;
            } else {
                document.getElementById('compose-subject').value = `RE: ${email.subject}`;
                document.getElementById('compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
            }
        })
}