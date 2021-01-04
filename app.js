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
var jsonContent = JSON.parse(`{"temp":"Loading..","p1":[{"voltage":"loading..","current":"Loading.."}],"p2":[{"voltage":"Loading..","current":"Loading.."}],"p3":[{"voltage":"Loading..","current":"Loading.."}],"p4":[{"voltage":"Loading..","current":"Loading.."}]}`)
//console.log(jsonContent.p2[0].voltage);
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
            io.sockets.emit('receive_hostname', {hostname: `${stdout}`})
        });
    })

    socket.on('update', data => {
        var bin = exec("./bin/aaeonSmartPOE.exe all", { timeout: 500 });

        bin.stdout.on('data', function(data) {
            //console.log(data)
            jsonContent = JSON.parse(data)
            //console.log(`updated`)
            io.sockets.emit('receive_temp', {temp: jsonContent.temp})
            io.sockets.emit('receive_p4v', {p4v: jsonContent.p4[0].voltage})
            io.sockets.emit('receive_p3v', {p3v: jsonContent.p3[0].voltage})
            io.sockets.emit('receive_p2v', {p2v: jsonContent.p2[0].voltage})
            io.sockets.emit('receive_p1v', {p1v: jsonContent.p1[0].voltage})
            io.sockets.emit('receive_p4c', {p4c: jsonContent.p4[0].current})
            io.sockets.emit('receive_p3c', {p3c: jsonContent.p3[0].current})
            io.sockets.emit('receive_p2c', {p2c: jsonContent.p2[0].current})
            io.sockets.emit('receive_p1c', {p1c: jsonContent.p1[0].current})
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

    socket.on('port_on', data => {
        var cmd = "./bin/aaeonSmartPOE.exe " + data.port + " ON";
        var bin = exec(cmd, { timeout: 500 })
        bin.stdout.on('data', function(data) {
            io.sockets.emit('device_on_busy', {port: data.port})
        });
    })

    socket.on('port_off', data => {
        var cmd = "./bin/aaeonSmartPOE.exe " + data.port + " OFF";
        var bin = exec(cmd, { timeout: 500 })
        bin.stdout.on('data', function(data) {
            io.sockets.emit('device_off_busy', {port: data.port})
        });
    })

})
