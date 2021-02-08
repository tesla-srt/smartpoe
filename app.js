const express = require('express')
let ejs = require('ejs')
const socketio = require('socket.io')
const { spawn } = require("child_process")
const { exec } = require("child_process")
const toml = require('toml-js');
const cors = require('cors');
const { Curl } = require('node-libcurl');
const CurlAuth = require("node-libcurl").CurlAuth;
const CurlFeature = require("node-libcurl").CurlFeature;
const Stream = require('node-rtsp-stream')
const app = express();
let base64 = require('base-64');

var fs = require("fs");
var config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'))
const updatecmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe all"

setInterval(function() {
    //TODO:
    //Try to get images
    //On error send email

}, 5000);







app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.render('index')
})

app.get('/cam/:num/u/:user/p/:pass', (req, res) => {
    res.contentType('image/jpeg');
    let name = req.params.num;
    //let password = req.params.pass.toString();
    let pass = req.params.pass
    let user = req.params.user

    //let username = req.params.user.toString();
    //let src = 'http://' + name + '/SnapshotJPEG';
    let src = 'http://'+name+'/SnapshotJPEG';
    let result = ""
    const curl = new Curl();
    let close = curl.close.bind(curl);
    curl.enable(CurlFeature.Raw)
    curl.setOpt('URL', src);
    curl.setOpt('HTTPAUTH', CurlAuth.Digest);
    //curl.setOpt('RETURNTRANSFER', 1);
    curl.setOpt('COOKIEJAR','bin/cookies.txt');
    curl.setOpt('COOKIEFILE','bin/cookies.txt');
    curl.setOpt('USERPWD', `${user}:${pass}`); //stuff goes in here
    curl.setOpt('HTTPHEADER', ['Content-Type: image/jpeg', 'Accept: image/jpeg']);
    if (!fs.existsSync('bin/cookies.txt')) {
        fs.writeFileSync('bin/cookies.txt','')
    }
    curl
        .on('end', function(code, body, headers) {
            res.send(body);
            curl.close();
        })
        .on('error', function(e) {
            console.error(e)
            curl.close.bind(curl);
        })
        .perform();
    //curl.on('end', close);
    //curl.on('error', close);
});

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
    location: config.info.location,
    temp: 0.0,
    totalWatts: 0.00,
    ports: [
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00,
            ipv4: config.cams.alpha.ip,
            ipv4enabled: false,
            user: config.cams.alpha.user,
            pass: config.cams.alpha.pass
        },
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00,
            ipv4: config.cams.bravo.ip,
            ipv4enabled: false,
            user: config.cams.bravo.user,
            pass: config.cams.bravo.pass
        },
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00,
            ipv4: config.cams.charlie.ip,
            ipv4enabled: false,
            user: config.cams.charlie.user,
            pass: config.cams.charlie.pass
        },
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00,
            ipv4: config.cams.delta.ip,
            ipv4enabled: false,
            user: config.cams.delta.user,
            pass: config.cams.delta.pass
        }]
}

let ports = [p1, p2, p3, p4];

function getcamurl() {
}

/*let stream1 = new Stream({
    name: 'cam1',
    streamUrl: 'rtsp://admin:S0larr1g@192.168.1.10/h265/ch1/main/av_stream',
    wsPort: 9999,
    ffmpegOptions: { // options ffmpeg flags
        '-stats': '', // an option with no neccessary value uses a blank string
        '-r': 30 // options with required values specify the value after the key
    }
})*/

var jsonContent = JSON.parse(`{"temp":"Loading..","p1":[{"voltage":"0.00","current":"0.00"}],"p2":[{"voltage":"0.00","current":"0.00"}],"p3":[{"voltage":"0.00","current":"0.00"}],"p4":[{"voltage":"0.00","current":"0.00"}]}`)
io.on('connection', socket => {

    io.sockets.emit('receive_location', sp.location)
    //console.log("New user connected")

    socket.on('set_location', data => {
        config.info.location = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p1ip', data => {
        config.cams.alpha.ip = data.trim();
        sp.ports[0].ipv4 = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p1u', data => {
        config.cams.alpha.user = data.trim();
        sp.ports[0].user = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p1p', data => {
        config.cams.alpha.pass = data.trim();
        sp.ports[0].pass = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p1state', data => {
        config.cams.alpha.enabled = data;
        sp.ports[0].ipv4enabled = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p2state', data => {
        config.cams.bravo.enabled = data;
        sp.ports[1].ipv4enabled = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })


    socket.on('set_p2ip', data => {
        config.cams.bravo.ip = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p2u', data => {
        config.cams.bravo.user = data.trim();
        sp.ports[1].user = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p2p', data => {
        config.cams.bravo.pass = data.trim();
        sp.ports[1].pass = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p3ip', data => {
        config.cams.charlie.ip = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p3u', data => {
        config.cams.charlie.user = data.trim();
        sp.ports[2].user = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p3p', data => {
        config.cams.charlie.pass = data.trim();
        sp.ports[2].pass = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p3state', data => {
        config.cams.charlie.enabled = data;
        sp.ports[2].ipv4enabled = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })


    socket.on('set_p4ip', data => {
        config.cams.delta.ip = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p4u', data => {
        config.cams.delta.user = data.trim();
        sp.ports[3].user = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p4p', data => {
        config.cams.delta.pass = data.trim();
        sp.ports[3].pass = data.trim();
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p4state', data => {
        config.cams.delta.enabled = data;
        sp.ports[3].ipv4enabled = data;
        fs.writeFile('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

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
            try {
                jsonContent = JSON.parse(data)
            } catch (ex) {
                return;
            }
            //console.log(`updated`)
        });


        bin.stderr.on('data', function(data) {
            let stream = fs.createReadStream('bin/all.json')
            stream.on('data', function (chunk) {
                console.log(`fallback: local file`)
                try {
                    jsonContent = JSON.parse(chunk.toString())
                }
                catch(err) {
                    return;
                }

            });

        });
        config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
        let port1 = sp.ports[0];
        let port2 = sp.ports[1];
        let port3 = sp.ports[2];
        let port4 = sp.ports[3];
        let streams = new Array(sp.ports.length);
        sp.temp = jsonContent.temp;
        sp.location = config.info.location;

        port3.voltage = jsonContent["p3"][0].voltage
        port3.current = jsonContent["p3"][0].current
        port3.ipv4 = config.cams.charlie.ip
        port3.ipv4enabled = config.cams.charlie.enabled
        port3.pass = config.cams.charlie.pass
        port3.user = config.cams.charlie.user

        port4.voltage = jsonContent["p4"][0].voltage
        port4.current = jsonContent["p4"][0].current
        port4.ipv4 = config.cams.delta.ip
        port4.ipv4enabled = config.cams.delta.enabled
        port4.pass = config.cams.delta.pass
        port4.user = config.cams.delta.user



        port2.voltage = jsonContent["p2"][0].voltage
        port2.current = jsonContent["p2"][0].current
        port2.ipv4 = config.cams.bravo.ip
        port2.ipv4enabled = config.cams.bravo.enabled
        port2.pass = config.cams.bravo.pass
        port2.user = config.cams.bravo.user



        port1.voltage = jsonContent["p1"][0].voltage
        port1.current = jsonContent["p1"][0].current
        port1.ipv4 = config.cams.alpha.ip
        port1.ipv4enabled = config.cams.alpha.enabled
        port1.pass = config.cams.alpha.pass
        port1.user = config.cams.alpha.user



        port1.watts = (port1.current / 1000) * port1.voltage;
        port2.watts = (port2.current / 1000) * port2.voltage;
        port3.watts = (port3.current / 1000) * port3.voltage;
        port4.watts = (port4.current / 1000) * port4.voltage;

        sp.totalWatts = port1.watts + port2.watts + port3.watts + port4.watts;

        //sp.ports[0].stream.pipeStreamToSocketServer();
        //io.sockets.emit('receive_log', sp.location)
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

    socket.on('restart_steam', data => {
        switch(data.stream) {
            case "0":
                sp.ports[0].stream =  new Stream({
                    name: 'Cam 1',
                    //TODO
                    streamUrl: 'rtsp://' + config.cams.alpha.user + ':' + config.cams.alpha.pass + '@'+ config.cams.alpha.ip + ':554/MediaInput/h265',
                    //streamUrl: 'rtsp://127.0.0.1:8550/',
                    wsPort: 10024,
                    ffmpegOptions: { // options ffmpeg flags
                        '-r': 30, // options with required values specify the value after the key
                    }
                })
                break;
            case "1":
                sp.ports[1].stream.startMpeg1Stream()
                break;
            case "2":
                sp.ports[2].stream.startMpeg1Stream()
                break;
            case "3":
                sp.ports[3].stream.startMpeg1Stream()
                break;
        }
    })

})

