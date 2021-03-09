const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (msg) => {
	renderMessages(JSON.parse(msg.data));
};

const renderMessages = (data) => {

	if('error' in data)
	{
		document.getElementById('messages').innerHTML = `<p>${data.error}</p>`;
	}
	else
	{
		let html='';
		data.forEach((message)=>{ html+=`<p>${message.message}</p>`});
		//const html1 = data.map((item) => `<p>${item}</p>`).join(' ');
		document.getElementById('messages').innerHTML = html;
	}
};

const handleSubmit = (evt) => {
	evt.preventDefault();
	const message = document.getElementById('message');
	const author = document.getElementById('author');

	let values = {
		message: message.value,
		author: author.value
	}
	
	let json = JSON.stringify(values);
	ws.send(json);
	message.value = '';
	author.value = '';
};

const form = document.getElementById('form');
form.addEventListener('submit', handleSubmit);
