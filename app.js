const express = require('express')
const socketio = require('socket.io')
const { spawn } = require("child_process")
const { exec } = require("child_process")
const app = express()
var fs = require("fs");

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(3001,'0.0.0.0')

//initialize socket for the server
const io = socketio(server)
const p1 = {
    current: 0.00,
    voltage: 0.00
}
const p2 = {
    current: 0.00,
    voltage: 0.00
}
const p3 = {
    current: 0.00,
    voltage: 0.00
}
const p4 = {
    current: 0.00,
    voltage: 0.00
}
let  p1w, p2w, p3w, p4w, totalWatts;

var jsonContent = JSON.parse(`{"temp":"Loading..","p1":[{"voltage":"0.00","current":"0.00"}],"p2":[{"voltage":"0.00","current":"0.00"}],"p3":[{"voltage":"0.00","current":"0.00"}],"p4":[{"voltage":"0.00","current":"0.00"}]}`)
//console.log(jsonContent.p2[0].voltage);
io.on('connection', socket => {
    //console.log("New user connected")

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
        let bin = spawn('C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe all', { shell: true });

        bin.stdout.on('data', function(data) {
            //console.log(data)
            jsonContent =  JSON.parse(data)
            //console.log(`updated`)
        });


        bin.stderr.on('data', function(data) {
            let stream = fs.createReadStream('bin/all.json')
            stream.on('data', function (chunk) {
                console.log(`fallback: local file`)
                jsonContent = JSON.parse(chunk.toString())
            });

        });

        p3.voltage = jsonContent.p3[0].voltage
        p3.current = jsonContent.p3[0].current

        p4.voltage = jsonContent.p4[0].voltage
        p4.current = jsonContent.p4[0].current

        p2.voltage = jsonContent.p2[0].voltage
        p2.current = jsonContent.p2[0].current

        p1.voltage = jsonContent.p1[0].voltage
        p1.current = jsonContent.p1[0].current

        p1w = (p1.current / 1000) * p1.voltage;
        p2w = (p2.current / 1000) * p2.voltage;
        p3w = (p3.current / 1000) * p3.voltage;
        p4w = (p4.current / 1000) * p4.voltage;

        totalWatts = p1w + p2w + p3w + p4w;

        io.sockets.emit('receive_temp', {temp: jsonContent.temp})
        io.sockets.emit('receive_watt', {watts: totalWatts})
        io.sockets.emit('receive_p4v', {p4v: p4.voltage})
        io.sockets.emit('receive_p3v', {p3v: p3.voltage})
        io.sockets.emit('receive_p2v', {p2v: p2.voltage})
        io.sockets.emit('receive_p1v', {p1v: p1.voltage})
        io.sockets.emit('receive_p4c', {p4c: p4.current})
        io.sockets.emit('receive_p3c', {p3c: p3.current})
        io.sockets.emit('receive_p2c', {p2c: p2.current})
        io.sockets.emit('receive_p1c', {p1c: p1.current})
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
        let cmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe " + data.port + " ON";
        let bin = spawn(cmd, { shell: true })
        bin.stdout.on('data', function(data) {
            console.log(`port_on_busy: ` + data.port)
            io.sockets.emit('device_on_busy', {port: data.port})
        });
    })

    socket.on('port_off', data => {
        let cmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe " + data.port + " OFF";
        let bin = spawn(cmd, { shell: true })
        bin.stdout.on('data', function(data) {
            console.log(`port_off_busy: ` + data.port)
            io.sockets.emit('device_off_busy', {port: data.port})
        });
    })

})
