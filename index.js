const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const spawn = require("child_process").spawn;

app.get('/', function(req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        socket.username = username;
        socket.chat_history = [];
        const message = 'hi <i>' + socket.username + '</i>';
        socket.chat_history.push({'speaker':'Neptune','message':message});
        socket.emit('chat_message', '<strong>Neptune: </strong>' + message);
    });

    socket.on('chat_message', function(message) {
        socket.chat_history.push({'speaker':'user','message':message})
        socket.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);

        let feed_string = ['./dialogpt_txtgen.py'];
	let speaker = 'Neptune';
	let curr_string = ''
        for (let i = 0; i < socket.chat_history.length; i++){
            if(speaker === socket.chat_history[i]['speaker']){
		curr_string = curr_string + socket.chat_history[i]['message'];
	    }
	    else{
		feed_string.push(curr_string);
		curr_string = socket.chat_history[i]['message'];
		speaker = socket.chat_history[i]['speaker'];
	  }
        }
        feed_string.push(curr_string);

        const py = spawn('python3',feed_string);
        py.stdout.on('data',function(data){
          socket.chat_history.push({'speaker':'Neptune','message':data});
          socket.emit('chat_message','<strong>Neptune: </strong>' + data);
        })
        py.stderr.on('data',function(data){
          socket.chat_history.push({'speaker':'errormsg','message':data});
          socket.emit('chat_message','<strong>ERROR: </strong>' + data);
        })
    });

});

const server = http.listen(80, function() {
    console.log('listening on *:80');
});
