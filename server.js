const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pg = require('pg');
const dotenv = require('dotenv');

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
app.use(express.static('public'));

// Chat test
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// Socket connection
io.on('connection', function(socket) {
	socket.on('chat message', function(data){
		io.sockets.emit('chat message', data);
  });
});

http.listen(process.env.WEBSRVPORT, () => console.log("Listening ..."));
