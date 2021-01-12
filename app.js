const express = require('express')
const socketio = require('socket.io')
const { spawn } = require("child_process")
const { exec } = require("child_process")
const app = express()
var fs = require("fs");

const updatecmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe all"

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
    voltage: 0.00,
    watts: 0.00
}
const p2 = {
    current: 0.00,
    voltage: 0.00,
    watts: 0.00
}
const p3 = {
    current: 0.00,
    voltage: 0.00,
    watts: 0.00
}
const p4 = {
    current: 0.00,
    voltage: 0.00,
    watts: 0.00
}

const sp = {
    hostname: '',
    temp: 0.0,
    totalWatts: 0.00,
    ports: [
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00
        },
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00
        },
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00
        },
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00
        }]
}

let ports = [p1, p2, p3, p4];

var jsonContent = JSON.parse(`{"temp":"Loading..","p1":[{"voltage":"0.00","current":"0.00"}],"p2":[{"voltage":"0.00","current":"0.00"}],"p3":[{"voltage":"0.00","current":"0.00"}],"p4":[{"voltage":"0.00","current":"0.00"}]}`)
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
            //io.sockets.emit('receive_hostname', {hostname: `${stdout}`})
            sp.hostname = stdout;
        });
    })

    socket.on('update', data => {
        let bin = spawn(updatecmd, { shell: true });

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
        let port1 = sp.ports[0];
        let port2 = sp.ports[1];
        let port3 = sp.ports[2];
        let port4 = sp.ports[3];
        sp.temp = jsonContent.temp;

        port3.voltage = jsonContent["p3"][0].voltage
        port3.current = jsonContent["p3"][0].current

        port4.voltage = jsonContent["p4"][0].voltage
        port4.current = jsonContent["p4"][0].current

        port2.voltage = jsonContent["p2"][0].voltage
        port2.current = jsonContent["p2"][0].current

        port1.voltage = jsonContent["p1"][0].voltage
        port1.current = jsonContent["p1"][0].current

        port1.watts = (port1.current / 1000) * port1.voltage;
        port2.watts = (port2.current / 1000) * port2.voltage;
        port3.watts = (port3.current / 1000) * port3.voltage;
        port4.watts = (port4.current / 1000) * port4.voltage;

        sp.totalWatts = port1.watts + port2.watts + port3.watts + port4.watts;
        io.sockets.emit('receive_update', sp);
        //io.sockets.emit('receive_temp', sp.temp);

/*        io.sockets.emit('receive_temp', {temp: sp.temp})
        io.sockets.emit('receive_watt', {watts: sp.totalWatts})
        io.sockets.emit('receive_p4v', {p4v: p4.voltage})
        io.sockets.emit('receive_p3v', {p3v: p3.voltage})
        io.sockets.emit('receive_p2v', {p2v: p2.voltage})
        io.sockets.emit('receive_p1v', {p1v: p1.voltage})
        io.sockets.emit('receive_p4c', {p4c: p4.current})
        io.sockets.emit('receive_p3c', {p3c: p3.current})
        io.sockets.emit('receive_p2c', {p2c: p2.current})
        io.sockets.emit('receive_p1c', {p1c: p1.current})*/
    })

    socket.on('get_temp', data => {
        io.sockets.emit('receive_temp', {message: sp.temp})
    })

    socket.on('get_p3v', data => {
        io.sockets.emit('receive_p3v', {message: p3.voltage})
    })

    socket.on('get_p3c', data => {
        io.sockets.emit('receive_p3c', {message: p3.current})
    })

    socket.on('get_p1v', data => {
        io.sockets.emit('receive_p1v', {message: p1.voltage})
    })

    socket.on('get_p1c', data => {
        io.sockets.emit('receive_p1c', {message: p1.current})
    })

    socket.on('get_p2v', data => {
        io.sockets.emit('receive_p2v', {message: p2.voltage})
    })

    socket.on('get_p2c', data => {
        io.sockets.emit('receive_p2c', {message: p2.current})
    })

    socket.on('get_p4v', data => {
            io.sockets.emit('receive_p4v', {message: p4.voltage})
    })

    socket.on('get_p4c', data => {
        io.sockets.emit('receive_p4c', {message: p4.current})
    })

    socket.on('port_on', msg => {
        let cmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe " + msg.port + " ON";
        let bin = spawn(cmd, { shell: true })
        bin.stdout.on('data', function(data) {
            jsonContent = JSON.parse(data);
            console.log(`port_on_busy: ` + msg.port)
            io.sockets.emit('device_on_busy', {port: msg.port})
        });
    })

    socket.on('port_off', msg => {
        let cmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe " + msg.port + " OFF";
        let bin = spawn(cmd, { shell: true })
        bin.stdout.on('data', function(data) {
            jsonContent = JSON.parse(data);
            console.log(`port_off_busy: ` + msg.port)
            io.sockets.emit('device_off_busy', {port: msg.port})
        });
    })
})
