const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pg = require('pg');
const dotenv = require('dotenv');
const Nexmo = require('nexmo');

const pool = new pg.Pool();

dotenv.config({ path: './.env' });

// Database test
app.get('/dbtest', (req, res) => {
pool.connect()
	.then(client => {
		return client.query('SELECT * FROM t_test')
			.then(res => {
				client.release();
				console.log(res.rows[0]);
			})
			.catch(err => {
				client.release();
				console.log(err.stack);
			});
	});

	res.send("DB test done. See server console for details.");
});

// Static files
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// Chat test
app.get('/chat', (req, res) => {
	res.sendFile(__dirname + '/public/chat.html');
});

// SMS test
app.get('/sms', (req, res) => {
	res.sendFile(__dirname + '/public/sms.html');
});


app.get('/sendSms', (req, res) => {
	const nexmo = new Nexmo({
	  apiKey: 'f4ceb37c',
	  apiSecret: 'q6yJXtRmT3VqpUyx'
	});
	
	const from = '12262426276';
	const to = req.query.number;
	const text = req.query.message;
	nexmo.message.sendSms(from, to, text);

	res.sendFile(__dirname + '/public/sms.html');
});

// Socket connection
io.on('connection', function(socket) {
	socket.on('chat message', function(data){
		io.sockets.emit('chat message', data);
  });
});

http.listen(process.env.WEBSRVPORT, () => console.log("Listening ..."));
