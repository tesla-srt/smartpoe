const express = require('express')
const socketio = require('socket.io')
const { exec } = require("child_process");
const app = express()
var fs = require("fs");

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(3000,'0.0.0.0')

//initialize socket for the server
const io = socketio(server)
var jsonContent = JSON.parse(`{"temp":"Loading..","p1":[{"voltage":"loading..","current":"Loadin.."}],"p2":[{"voltage":"Loading..","current":"Loading.."}],"p3":[{"voltage":"Loading..","current":"Loading.."}],"p4":[{"voltage":"Loading..","current":"Loading.."}]}`)
console.log(jsonContent.p2[0].voltage);
io.on('connection', socket => {
    console.log("New user connected")

    socket.on('get_hostname', data => {
        
        exec("hostname", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_hostname', {message: `${stdout}`})
        });
    })

    socket.on('update', data => {
        var bin = exec("./bin/aaeonSmartPOE.exe all");

        bin.stdout.on('data', function(data) {
            console.log(data)
            jsonContent = JSON.parse(data)
            console.log(`updated`)
            io.sockets.emit('receive_temp', {message: jsonContent.temp})
            io.sockets.emit('receive_p4v', {message: jsonContent.p4[0].voltage})
            io.sockets.emit('receive_p3v', {message: jsonContent.p3[0].voltage})
            io.sockets.emit('receive_p2v', {message: jsonContent.p2[0].voltage})
            io.sockets.emit('receive_p1v', {message: jsonContent.p1[0].voltage})
            io.sockets.emit('receive_p4c', {message: jsonContent.p4[0].current})
            io.sockets.emit('receive_p3c', {message: jsonContent.p3[0].current})
            io.sockets.emit('receive_p2c', {message: jsonContent.p2[0].current})
            io.sockets.emit('receive_p1c', {message: jsonContent.p1[0].current})
        });

    })

    socket.on('get_temp', data => {
            io.sockets.emit('receive_temp', {message: jsonContent.temp})
    })

    socket.on('get_p3v', data => {
        io.sockets.emit('receive_p3v', {message: jsonContent.p3[0].voltage})
    })

    socket.on('get_p3c', data => {
        io.sockets.emit('receive_p3c', {message: jsonContent.p3[0].current})
    })

    socket.on('get_p1v', data => {
        io.sockets.emit('receive_p1v', {message: jsonContent.p1[0].voltage})
    })


    socket.on('get_p2v', data => {
        io.sockets.emit('receive_p2v', {message: jsonContent.p2[0].voltage})
    })

    socket.on('get_p4v', data => {
            io.sockets.emit('receive_p4v', {message: jsonContent.p4[0].voltage})
    })


})
