/**
 * Created by sxh on 16/9/2.
 */


var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
//var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var clients = [];

app.get('/', function(req, res){res.sendFile(__dirname + '/index.html');});
app.use(express.static('public'));
server.listen(3000, function(){console.log("server listening connection to 3000");});

mongoose.connect('mongodb://localhost/chatroom', function(err) {
    if(err) {
        console.log(err);
    }
});

var cs = mongoose.Schema({
    alias: String,
    msg: String,
    timestamp: String
});

var chatmodel = mongoose.model('cr2', cs);

io.on('connection', function(socket){

    //var dbcol = db.collection('crm1');
    console.log("Someone is connecting the server.");

    socket.on('judgelogin', function (name) {
        if(clients.indexOf(name) == -1){
            socket.name = name;
            socket.clientnum = clients.length;
            clients.push(name);
            socket.emit('loginok');
            io.emit('sysmsg', name, 'in');
            console.log(socket.name + " enters the room.");
            //dbcol.find().limit(100).sort({_id: 1}).toArray(function (err, res) {
            chatmodel.find({}, function (err, docs) {
                if(err)
                    throw err;
                socket.emit('showhistory', docs);
            });
        }
        else{
            socket.emit('nameexist');
        };

    });

    socket.on('dbmsg', function (message, timestamp) {
        socket.broadcast.emit('brmsg', socket.name, message, timestamp);
        var newmsg = new chatmodel({alias: socket.name, msg: message, timestamp: timestamp});
        newmsg.save(function (err) {
            if(err)
                throw err;
        });
        /*
        dbcol.insert({alias: socket.name, msg: message, timestamp: timestamp}, function () {
            console.log('Message of this client has successfully been inserted in mongodb');
        })
        */
    });

    socket.on('disconnect', function () {
        clients.splice(socket.clientnum, 1);
        socket.broadcast.emit('sysmsg', socket.name, 'out');
        console.log(socket.name + ' left the room');
    });

});
