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
        socket.chat_history.push({'speaker':'Joey','message':message});
        socket.emit('chat_message', '<strong>Joey: </strong>' + message);
    });

    socket.on('chat_message', function(message) {
        socket.chat_history.push({'speaker':'user','message':message})
        socket.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);

        let feed_string = '';
        for (let i = 0; i < socket.chat_history.length; i++){
          feed_string += socket.chat_history[i]['speaker'] + ': ' + socket.chat_history[i]['message'] + '\n';
        }
        feed_string += 'Joey: ';

        const py = spawn('python3',['./gpt_txtgen.py',feed_string]);
        py.stdout.on('data',function(data){
          socket.chat_history.push({'speaker':'Joey','message':data});
          socket.emit('chat_message','<strong>Joey: </strong>' + data);
        })
        py.stderr.on('data',function(data){
          socket.chat_history.push({'speaker':'errormsg','message':data});
          socket.emit('chat_message','<strong>ERROR: </strong>' + data);
        })
    });

});

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});
