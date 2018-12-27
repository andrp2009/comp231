const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pg = require('pg');
const dotenv = require('dotenv');
const Nexmo = require('nexmo');

const pool = new pg.Pool();

dotenv.config({ path: './.env' });

app.get('/login', (req, res) => {

(async () => {
	var query = "SELECT * FROM t_user WHERE email='" + req.query.email + "' AND password='" + req.query.pass + "'";
  var { rows } = await pool.query(query);

  if (rows.length == 1) {
		var code ='';
		for (var i = 0; i < 4; i++) {
			code += Math.floor((Math.random() * 10));
		}

		pool.query("UPDATE t_user set code='" + code + "' where email='" + req.query.email + "'");


		const nexmo = new Nexmo({
		  apiKey: 'f4ceb37c',
		  apiSecret: 'q6yJXtRmT3VqpUyx'
		});
		
		const from = '12262426276';
		const to = rows[0].phone;
		const text = code;
		nexmo.message.sendSms(from, to, text);


		res.sendFile(__dirname + '/public/enterCode.html');
  } else {
     res.status(404);
		res.sendFile(__dirname + '/public/error.html');
  }
})().catch(e =>
  setImmediate(() => {
    res.status(500);
    console.log(e);
    return res.send('Error: ' + e.message);
  })
 );
});


app.get('/confirmCode', (req, res) => {
(async () => {
	var query = "SELECT count(*) as present FROM t_user WHERE email='" + req.query.email + "' AND code='" + req.query.code + "'";
  var { rows } = await pool.query(query);

  if (rows.length && rows[0].present == 1) {
		res.sendFile(__dirname + '/public/dashboard.html');
  } else {
     res.status(404);
		res.sendFile(__dirname + '/public/error.html');
  }
})().catch(e =>
  setImmediate(() => {
    res.status(500);
    console.log(e);
    return res.send('Error: ' + e.message);
  })
 );

});




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


app.get('/query', (req, res) => {
(async () => {
  var { rows } = await pool.query('SELECT * FROM t_test');

  if (rows.length) {
     return res.send(rows);
  } else {
     res.status(404);
     return res.send('No response from database.');
  }
})().catch(e =>
  setImmediate(() => {
    res.status(500);
    console.log(e);
    return res.send('Error: ' + e.message);
  })
 );
});


// Static files
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/Login.html');
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
