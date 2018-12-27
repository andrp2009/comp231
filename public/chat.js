const socket = io.connect('http://192.71.227.28:80');

const message = document.getElementById('message');
const user = document.getElementById('user');
const btn = document.getElementById('send');
const output = document.getElementById('output');

btn.addEventListener('click', function(){
  socket.emit('chat message', {
      message: message.value,
      user: user.value
  });
  message.value = "";
});

socket.on('chat message', function(data){
  output.innerHTML += '<p><strong>' + data.user + ': </strong>' + data.message + '</p>';
});
