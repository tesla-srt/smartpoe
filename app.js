const express = require('express')
const socketio = require('socket.io')
const { exec } = require("child_process");
const app = express()

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

    socket.on('get_temp', data => {
        var waitTill = new Date(new Date().getTime() + 1.5 * 1000);
        while(waitTill > new Date()){}
        exec("./bin/aaeonSmartPOE.exe temp && cat ./bin/temperature.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_temp', {message: `${stdout}`})
        });
    })

    socket.on('get_p3v', data => {
        var waitTill = new Date(new Date().getTime() + 1.5 * 1000);
        while(waitTill > new Date()){}
        exec("./bin/aaeonSmartPOE.exe 1 voltage && cat ./bin/voltage_port_1.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            io.sockets.emit('receive_p3v', {message: `${stdout}`})
        });
    })

    socket.on('get_p3c', data => {
        var waitTill = new Date(new Date().getTime() + 1.5 * 1000);
        while(waitTill > new Date()){}
        exec("./bin/aaeonSmartPOE.exe 1 current && cat ./bin/current.mA._port_1.txt", (error, stdout, stderr) => {
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
        var waitTill = new Date(new Date().getTime() + 1.5 * 1000);
        while(waitTill > new Date()){}
        exec("./bin/aaeonSmartPOE.exe 0 voltage && cat ./bin/voltage_port_0.txt", (error, stdout, stderr) => {
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
        var waitTill = new Date(new Date().getTime() + 1.5 * 1000);
        while(waitTill > new Date()){}
        exec("./bin/aaeonSmartPOE.exe 2 voltage && cat ./bin/voltage_port_2.txt", (error, stdout, stderr) => {
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
        var waitTill = new Date(new Date().getTime() + 1.5 * 1000);
        while(waitTill > new Date()){}
        exec("./bin/aaeonSmartPOE.exe 3 voltage && cat ./bin/voltage_port_3.txt", (error, stdout, stderr) => {
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
