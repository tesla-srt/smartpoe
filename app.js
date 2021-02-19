const express = require('express')
let ejs = require('ejs')
const socketio = require('socket.io')
const {spawn} = require("child_process")
const {exec} = require("child_process")
process.setMaxListeners(1000);
const toml = require('toml-js');
const {Curl} = require('node-libcurl');
const CurlAuth = require("node-libcurl").CurlAuth;
const CurlFeature = require("node-libcurl").CurlFeature;
//const Stream = require('node-rtsp-stream')
const app = express();
const streamApp = express();
let base64 = require('base-64');

process.on('uncaughtException', function (exception) {
    // handle or ignore error
    console.log(exception);
});

var fs = require("fs");
var config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'))
const updatecmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe all"
const loncmd = "python C:/Users/TBIAdmin/node/smartpoe/bin/gps.lon.py"
const latcmd = "python C:/Users/TBIAdmin/node/smartpoe/bin/gps.lat.py"

app.set('view engine', 'ejs')
app.use(express.static('public'))

//initialize socket for the server
const {proxy} = require('rtsp-relay')(streamApp);
const server = app.listen(3001, '0.0.0.0') //initialize socket for the server
const io = socketio(server)
const streamServer = streamApp.listen(3002, '0.0.0.0')

streamApp.ws('/live/:cameraIP/u/:user/p/:pass', (ws, req) => {
    let uri = `rtsp://${req.params.user}:${req.params.pass}@${req.params.cameraIP}:554/MediaInput/h265/stream_3`
    //let uri = `rtsp://127.0.0.1:8554/`
    proxy({
        url: uri,
        verbose: false,
        //TODO: TEST
        additionalFlags: ['-preset', 'ultrafast', '-b:v', '128k']
    })(ws)
    //ws.send("ok");
})

app.get('/', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.render('index')
})

app.get('/401', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send('<h1>Invalid Login </h1>');
})

/**
 *
 */
app.get('/cam/:num/u/:user/p/:pass', (req, res) => {
    res.contentType('image/jpeg');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    let name = req.params.num;
    let pass = req.params.pass
    let user = req.params.user

    let src = 'http://' + name + '/SnapshotJPEG';
    let result = ""
    const curl = new Curl();
    //let close = curl.close.bind(curl);
    curl.enable(CurlFeature.Raw)
    curl.setOpt('URL', src);
    curl.setOpt('HTTPAUTH', CurlAuth.Digest);
    curl.setOpt('COOKIEJAR', 'bin/cookies.txt');
    curl.setOpt('COOKIEFILE', 'bin/cookies.txt');
    curl.setOpt('USERPWD', `${user}:${pass}`); //stuff goes in here
    curl.setOpt('HTTPHEADER', ['Content-Type: image/jpeg', 'Accept: image/jpeg']);
    if (!fs.existsSync('bin/cookies.txt')) {
        fs.writeFileSync('bin/cookies.txt', '')
    }
    curl
        .on('end', function (code, body, headers) {
            res.send(body);
            curl.close();
        })
        .on('error', function (e) {
            res.status(404);
            res.sendFile(__dirname + '/public/img/img404.png');
            curl.close();
        })
        .perform();
});


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
    version: '',
    hostname: '',
    location: config.info.location,
    temp: 0.0,
    totalWatts: 0.00,
    pin: config.info.pin,
    lat: '',
    lon: '',
    ports: [
        {
            voltage: 0.00,
            current: 0.00,
            watts: 0.00,
            ipv4: config.cams.alpha.ip,
            ipv4enabled: false,
            user: config.cams.alpha.user,
            pass: config.cams.alpha.pass,
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

var jsonContent = JSON.parse(`{"temp":"Loading..","p1":[{"voltage":"0.00","current":"0.00"}],"p2":[{"voltage":"0.00","current":"0.00"}],"p3":[{"voltage":"0.00","current":"0.00"}],"p4":[{"voltage":"0.00","current":"0.00"}]}`)
io.on('connection', socket => {


    io.sockets.emit('receive_location', sp.location)
    //console.log("New user connected")

    socket.on('set_location', data => {
        try {
            config.info.location = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.info.location = data.trim();
        }
        sp.location = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p1ip', data => {
        try {
            config.cams.alpha.ip = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.alpha.ip = data.trim();
        }
        sp.ports[0].ipv4 = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
    })

    socket.on('set_p1u', data => {
        try {
            config.cams.alpha.user = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.alpha.user = data.trim();
        }
        sp.ports[0].user = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });

    })

    socket.on('set_p1p', data => {
        try {
            config.cams.alpha.pass = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.alpha.pass = data.trim();

        }
        sp.ports[0].pass = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p1state', data => {
        try {
            config.cams.alpha.enabled = data;
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.alpha.enabled = data;

        }
        sp.ports[0].ipv4enabled = data;
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p2state', data => {
        try {
            config.cams.bravo.enabled = data;
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.bravo.enabled = data;
        }
        sp.ports[1].ipv4enabled = data;
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })


    socket.on('set_p2ip', data => {
        try {
            config.cams.bravo.ip = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.bravo.ip = data.trim();
        }
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        // config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p2u', data => {
        try {
            config.cams.bravo.user = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.bravo.user = data.trim();
        }
        sp.ports[1].user = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p2p', data => {
        try {
            config.cams.bravo.pass = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.bravo.pass = data.trim();
        }
        sp.ports[1].pass = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p3ip', data => {
        try {
            config.cams.charlie.ip = data;
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.charlie.ip = data;

        }
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p3u', data => {
        try {
            config.cams.charlie.user = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.charlie.user = data.trim();
        }
        sp.ports[2].user = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p3p', data => {
        try {
            config.cams.charlie.pass = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.charlie.pass = data.trim();
        }
        sp.ports[2].pass = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p3state', data => {
        try {
            config.cams.charlie.enabled = data;
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.charlie.enabled = data;

        }
        sp.ports[2].ipv4enabled = data;
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })


    socket.on('set_p4ip', data => {
        try {
            config.cams.delta.ip = data;
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.delta.ip = data;
        }
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p4u', data => {
        try {
            config.cams.delta.user = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.delta.user = data.trim();

        }
        sp.ports[3].user = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        // config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p4p', data => {
        try {
            config.cams.delta.pass = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.delta.pass = data.trim();
        }
        sp.ports[3].pass = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_p4state', data => {
        try {
            config.cams.delta.enabled = data;
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.cams.delta.enabled = data;
        }
        sp.ports[3].ipv4enabled = data;
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('set_pin', data => {
        try {
            config.info.pin = data.trim();
        } catch (ex) {
            console.error(`ERROR: ${ex}`)
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            config.info.pin = data.trim();
        }
        sp.pin = data.trim();
        fs.writeFileSync('bin/iptable.txt', toml.dump(config), function (err) {
            if (err) return console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('get_hostname', data => {

        exec("hostname", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            sp.hostname = stdout;
        });
    })

    socket.on('update', async data => {
        let okay = false;
        let bin = spawn(updatecmd, {shell: true});
        console.log('request update')
        try {
            config = await toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            console.log('Config Loaded')
        } catch (e) {
            console.log('Config Loading Failed')
        }

        bin.stderr.on('data', function (data) {
            fs.readFile('bin/all.json', 'utf8', async (err, data) => {
                if (err) {
                    console.log(err)
                }

                try {
                    console.log(`fallback: local file`)
                    jsonContent = await JSON.parse(data)
                    console.log('Port Info Updated')
                } catch (e) {
                    console.log('Fallback Failed');

                }

            })

        });


        bin.stdout.on('data', async function (data) {
            let stuff = await data.toString();
            try {
                console.log('Port Info Updated')
                jsonContent = await JSON.parse(stuff)
            } catch (ex) {
                console.log(ex)
            }
            let port1 = sp.ports[0];
            let port2 = sp.ports[1];
            let port3 = sp.ports[2];
            let port4 = sp.ports[3];
            if (jsonContent.temp != 'N/A') {
                try {
                    sp.temp = jsonContent.temp;
                    sp.location = config.info.location;
                    sp.version = config.info.version;
                    port3.ipv4 = config.cams.charlie.ip
                    port3.ipv4enabled = config.cams.charlie.enabled
                    port3.pass = config.cams.charlie.pass
                    port3.user = config.cams.charlie.user
                    port4.ipv4 = config.cams.delta.ip
                    port4.ipv4enabled = config.cams.delta.enabled
                    port4.pass = config.cams.delta.pass
                    port4.user = config.cams.delta.user
                    port2.ipv4 = config.cams.bravo.ip
                    port2.ipv4enabled = config.cams.bravo.enabled
                    port2.pass = config.cams.bravo.pass
                    port2.user = config.cams.bravo.user
                    port1.ipv4 = config.cams.alpha.ip
                    port1.ipv4enabled = config.cams.alpha.enabled
                    port1.pass = config.cams.alpha.pass
                    port1.user = config.cams.alpha.user
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
                    okay = true
                } catch (ex) {
                    console.log(`Error: ${ex}`);
                }
            }


        });

         bin.on('exit', async function () {
             /*let port1 = sp.ports[0];
             let port2 = sp.ports[1];
             let port3 = sp.ports[2];
             let port4 = sp.ports[3];
             if (jsonContent.temp != 'N/A') {
                 try {
                     sp.temp = jsonContent.temp;
                     sp.location = config.info.location;
                     sp.version = config.info.version;
                     port3.ipv4 = config.cams.charlie.ip
                     port3.ipv4enabled = config.cams.charlie.enabled
                     port3.pass = config.cams.charlie.pass
                     port3.user = config.cams.charlie.user
                     port4.ipv4 = config.cams.delta.ip
                     port4.ipv4enabled = config.cams.delta.enabled
                     port4.pass = config.cams.delta.pass
                     port4.user = config.cams.delta.user
                     port2.ipv4 = config.cams.bravo.ip
                     port2.ipv4enabled = config.cams.bravo.enabled
                     port2.pass = config.cams.bravo.pass
                     port2.user = config.cams.bravo.user
                     port1.ipv4 = config.cams.alpha.ip
                     port1.ipv4enabled = config.cams.alpha.enabled
                     port1.pass = config.cams.alpha.pass
                     port1.user = config.cams.alpha.user
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
                     okay = true
                 } catch (ex) {
                     console.log(`Error: ${ex}`);
                 }
             }*/
             if (okay) {
                 io.sockets.emit('receive_update', sp);
                 console.log('update completed')
             }
         })

    })

    socket.on('get_coords', data => {
        getCoords()
        io.sockets.emit('receive_coords', sp);
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
        let bin = spawn(cmd, {shell: true})
        bin.stdout.on('data', function (data) {
            try {
                jsonContent = JSON.parse(data);
            } catch (e) {
                console.error(e);
            }
            console.log(`port_on_busy: ` + msg.port)
            io.sockets.emit('device_on_busy', {port: msg.port})
        });
    })

    socket.on('port_off', msg => {
        let cmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe " + msg.port + " OFF";
        let bin = spawn(cmd, {shell: true})
        bin.stdout.on('data', function (data) {
            try {
                jsonContent = JSON.parse(data);
            } catch (e) {
                console.error(e);
            }
            console.log(`port_off_busy: ` + msg.port)
            io.sockets.emit('device_off_busy', {port: msg.port})
        });
    })

    socket.on('restart_steam', data => {
        switch (data.stream) {
            case "0":
                console.log("New Stream")
                break;
            case "1":
                //sp.ports[1].stream.startMpeg1Stream()
                break;
            case "2":
                //sp.ports[2].stream.startMpeg1Stream()
                break;
            case "3":
                //sp.ports[3].stream.startMpeg1Stream()
                break;
        }
    })
})

function getCoords() {
    try {
        let bin2 = spawn(latcmd, {shell: true});

        bin2.stdout.on('data', function (data) {
            let lat = data.toString();
            //let lon = "07405.854056W";
            let brk = lat.indexOf('.') - 2;
            if (brk < 0) {
                brk = 0;
            }
            let minutes = lat.substr(brk, lat.length - 1);
            minutes = parseFloat(minutes)
            let degrees = lat.substr(0, brk);
            degrees = parseInt(degrees)
            let newLat = parseFloat(degrees + (minutes / 60));
            if (lat.indexOf("S") > 0) {
                newLat = (-1 * newLat);
            }
            sp.lat = newLat
        });
    } catch (err) {
        console.error(err);
    }

    /**
     * GPS Coords
     */
    try {
        let bin1 = spawn(loncmd, {shell: true});

        bin1.stdout.on('data', function (data) {
            let lon = data.toString();
            //let lon = "07405.854056W";
            let brk = lon.indexOf('.') - 2;
            if (brk < 0) {
                brk = 0;
            }
            let minutes = lon.substr(brk, lon.length - 1);
            minutes = parseFloat(minutes)
            let degrees = lon.substr(0, brk);
            degrees = parseInt(degrees)
            let newLon = parseFloat(degrees + (minutes / 60));
            if (lon.indexOf("W") > 0) {
                newLon = (-1 * newLon);
            }
            sp.lon = newLon
        });
    } catch (err) {
        console.error(err);
    }
}


