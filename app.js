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

    var contents = fs.readFileSync("./bin/all.json");
    var jsonContent = JSON.parse(contents);


    socket.on('get_temp', data => {
        exec("./bin/aaeonSmartPOE.exe all", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            contents = fs.readFileSync("./bin/all.json");
            jsonContent = JSON.parse(contents);
            io.sockets.emit('receive_temp', {message: jsonContent.temp})
        });
    })

    socket.on('get_p3v', data => {

        exec("./bin/aaeonSmartPOE.exe all", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            contents = fs.readFileSync("./bin/all.json");
            jsonContent = JSON.parse(contents);
            io.sockets.emit('receive_p3v', {message: jsonContent.p3.voltage})
        });
    })

    socket.on('get_p3c', data => {

        exec("./bin/aaeonSmartPOE.exe 1 current && sleep 2 && cat ./bin/current.mA._port_1.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_p3c', {message: `${stdout}`})
        });
    })

    socket.on('get_p1v', data => {

        exec("./bin/aaeonSmartPOE.exe 0 voltage && sleep 3 && cat ./bin/voltage_port_0.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_p1v', {message: `${stdout}`})
        });
    })


    socket.on('get_p2v', data => {
        exec("./bin/aaeonSmartPOE.exe 2 voltage && sleep 2 && cat ./bin/voltage_port_2.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_p2v', {message: `${stdout}`})
        });
    })

    socket.on('get_p4v', data => {

        exec("./bin/aaeonSmartPOE.exe 3 voltage && sleep 4 && cat ./bin/voltage_port_3.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_p4v', {message: `${stdout}`})
        });
    })


})
