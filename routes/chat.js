var express = require('express');
const Joi = require('joi');
var router = express.Router();
const ws = require('../wslib');

const Message = require('../models/message');

var messages = [
	{ id: 1, message: 'Hola soy Juan', author: 'Juan', ts: '1599865466352' },
	{ id: 2, message: 'Hola soy Hugo', author: 'Hugo', ts: '1594568465452' },
	{ id: 3, message: 'Hola soy Pedro', author: 'Pedro', ts: '146411276352' }
];

/* GET messages listing. */
router.get('/', function(req, res, next) {
	Message.findAll().then((result) => {
		res.send(result);
	});
});

/* GET message by timestamp. */
router.get('/:ts', function(req, res, next) {
	Message.findByPk(req.params.ts).then((result) => {
		res.send(result);
	});
	/*
	const mess = messages.find((item) => item.ts === req.params.ts);
	if (!mess) return res.status(404).send('The message with given timestamp was not found');
	res.send(mess);
	*/
});

router.post('/', function(req, res, next) {
	const schema = Joi.object({
		message: Joi.string().min(5).required(),
		author: Joi.string().regex(/([a-zA-Záéíóú]{1,}[\s]{1,}[a-zA-Záéíóú]{1,}[\s]{0,}){1,}/).min(1).required(),
		ts: Joi.string().min(1).required()
	});

	const validation = schema.validate(req.body);

	if (validation.error) {
		return res.status(400).send(validation.error.details[0].message);
	}

	const message = {
		//id: messages.length + 1,
		message: req.body.message,
		author: req.body.author,
		ts: req.body.ts
	};

	Message.create(message);
	//messages.push(message);

	Message.findOne({ where: { ts: req.body.ts } }).then((result) => {
		res.send(result);
	});
});

router.put('/:ts', function(req, res, next) {
	// Body correcto
	const schema = Joi.object({
		message: Joi.string().min(5).required(),
		author: Joi.string().regex(/([a-zA-Záéíóú]{1,}[\s]{1,}[a-zA-Záéíóú]{1,}[\s]{0,}){1,}/).min(1).required()
	});

	Message.findByPk(req.params.ts)
		.then((message) => {
			console.log(message);
			if (!message) return res.status(404).send('The message with given timestamp was not found');

			const validation = schema.validate(req.body);

			if (validation.error) {
				return res.status(400).send(validation.error.details[0].message);
			}
			return message;
		})
		.then(() => {
			Message.update(
				{ message: req.body.message, author: req.body.author },
				{ where: { ts: req.params.ts } }
			).then(() => {
				Message.findByPK(req.params.ts).then((message) => {
					res.send(message);
				});
			});
		});
	/*
	mess.message = req.body.message;
	mess.author = req.body.author;

	var updated = messages.find((item) => item.ts === mess.ts);

	//messages.push(message);
	res.send(updated);
	*/
});

router.delete('/:ts', function(req, res, next) {
	// Message exists
	const mess = messages.find((item) => item.ts === req.params.ts);
	if (!mess) return res.status(404).send('The message with given timestamp was not found');

	const index = messages.indexOf(mess);
	messages.splice(index, 1);

	res.status(204).send(messages);
});

module.exports = router;
