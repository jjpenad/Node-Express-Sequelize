const WebSocket = require('ws');
const Message = require('./models/message');
const Joi = require('joi');

const schema = Joi.object({
	message: Joi.string().min(5).required(),
	author: Joi.string().regex(/([a-zA-Záéíóú]{1,}[\s]{1,}[a-zA-Záéíóú]{1,}[\s]{0,}){1,}/).min(1).required(),
	ts: Joi.string().min(1).required()
});

const clients = [];

const wsConnection = (server) => {
	const wss = new WebSocket.Server({ server });

	wss.on('connection', (ws) => {
		clients.push(ws);
		sendMessages();

		ws.on('message', (message) => {
			let json = JSON.parse(message);

			const validation = schema.validate(json);

			if (validation.error) { 
				ws.send(JSON.stringify({error:validation.error.details[0].message}));
			}
			else{
				let mess = {
					ts: Date.now(),
					message: json.message,
					author: json.author,
				};
			
				Message.create(mess);
	
				sendMessages();
			}
		});
	});
};

const sendMessages = () => {
	Message.findAll().then((result)=>{
		clients.forEach((client) => {
			client.send(JSON.stringify(result));
		});
	});
};


exports.wsConnection = wsConnection;
exports.sendMessages = sendMessages;