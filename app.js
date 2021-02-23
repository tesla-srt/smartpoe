const express = require('express')
let ejs = require('ejs')
const socketio = require('socket.io')
const {spawn} = require("child_process")
const {exec} = require("child_process")
const {fork} = require('child_process');
const toml = require('toml-js');
const { Curl }  = require('node-libcurl');
const CurlAuth = require("node-libcurl").CurlAuth;
const CurlFeature = require("node-libcurl").CurlFeature;
//const Stream = require('node-rtsp-stream')
const app = express();
const server = app.listen(3001, '0.0.0.0') //initialize socket for the server
const io = socketio(server)
app.set('view engine', 'ejs')
app.use(express.static('public'))

const streamApp = express();
const updateWorker = fork('./update.js');
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
if (!fs.existsSync(__dirname + '/bin/cookies.txt')) {
    fs.writeFileSync(__dirname + 'bin/cookies.txt', '')
}

//initialize socket for the server
const {proxy} = require('rtsp-relay')(streamApp)
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

app.get('/test', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    let request = require('request');

    let r = {
        url: 'admin:S0larr1g@192.168.1.172/SnapshotJPEG',
        method: 'OPTIONS'
    };

    function f(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body)
            console.log(body)
        }
    }
    request(r, f);

})

/**
 *
 */
streamApp.get('/cam/:num/u/:user/p/:pass', async (req, res) => {
    res.contentType('image/jpeg');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    let name = req.params.num;
    let pass = req.params.pass
    let user = req.params.user

    let src = 'http://' + name + '/SnapshotJPEG';

    let result = ''

//let close = curl.close.bind(curl);
    let curl = new Curl();
    curl.enable(CurlFeature.Raw)
    curl.setOpt('URL', src);
    curl.setOpt('USERPWD', `${user}:${pass}`); //stuff goes in here
    curl.setOpt('HTTPHEADER', ['Content-Type: image/jpeg', 'Accept: image/jpeg']);
    curl.setOpt('HTTPAUTH', CurlAuth.Digest);
    curl.setOpt('COOKIEJAR', 'bin/cookies.txt');
    curl.setOpt('COOKIEFILE', 'bin/cookies.txt');

    await curl
        .on('end', function (code, body, headers) {
            //let buffer = Buffer.from(body).toString('base64')
            //result = buffer
            res.send(body)
            //res.json({img: result});
            curl.close();
        })
        .on('error', function (e) {
            //res.status(404);
            //let buffer = Buffer.from(fs.readFileSync('public/img/img404.png', 'utf-8')).toString('base64')
            //result = buffer
            res.sendFile(__dirname + '/public/img/img404.png')
            //res.json({img: result});
            //res.send('poo');
            curl.close();
        })
        .perform();

    /*// fork another process
    const worker = fork('./snapshot.js');
    worker.send([src, user, pass]);
    worker.on('message', (message) => {
        res.json({ img: message});
    });*/
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

var sp = {
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

exec("hostname", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }
    sp.hostname = stdout;
});

var jsonContent = {"temp":"Loading..","p1":[{"voltage":"0.00","current":"0.00"}],"p2":[{"voltage":"0.00","current":"0.00"}],"p3":[{"voltage":"0.00","current":"0.00"}],"p4":[{"voltage":"0.00","current":"0.00"}]}
io.on('connection', socket => {
    //io.sockets.emit('receive_location', sp.location)
    //console.log("New user connected")

    socket.on('ping', data => {
        var isWin = process.platform === "win32";
        let options = [];
        if (isWin) {
            options = [`${data.toString()}`, '-n', '3']
        } else {
            options = [`${data.toString()}`, '-c', '3']
        }
        let ping = spawn(`ping`, options, {shell: true})

        let result = '';
        ping.stdout.on('data', function (data) {
            result += data + '';
        })

        ping.stderr.on('data', (data) => {
            //res.status(0)
            console.log(data.toString())
        })

        ping.on('close', function () {
            io.sockets.emit('pingOut', result)
        })
    })

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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
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
            if (err) console.log(err);
        });
        //config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
    })

    socket.on('get_hostname', data => {


    })

    socket.on('update', data => {
        let jsonData = '';
        console.log('request update')
        try {
            config = toml.parse(fs.readFileSync('bin/iptable.txt', 'utf-8'));
            console.log('Config Loaded')
        } catch (e) {
            console.error(e)
            console.log('Config Loading Failed')
        }


        /*let bin = spawn(updatecmd, {shell: true});
        bin.stderr.on('data', async function (data) {
            let foo = fs.readFileSync('bin/all.json', 'utf-8')
            try {
                console.log(`fallback: local file`)
                jsonData = await JSON.parse(foo)
            } catch (e) {
                console.log('Fallback Failed');
            }

        });

        bin.stdout.on('data', async function (data) {
            try {
                console.log('JSON Parsed: realtime')
                jsonData = await JSON.parse(data)
            } catch (ex) {
                console.log(ex)
            }
        });
*/

        // fork another process

        //const mails = request.body.emails;
        // send list of e-mails to forked process
        updateWorker.send([sp, config]);
    })

    updateWorker.on('message', (message) => {
        //config = message[1]
        sp = message;
        socket.emit('receive_update', message)
    })

    socket.on('get_coords', async data => {
        await getCoords()
        io.sockets.emit('update');
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
        bin.on('close', () => {
            sp.ports[msg.port].isRebooting = false
        })
    })

    socket.on('port_off', msg => {
        let cmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe " + msg.port + " OFF";
        let bin = spawn(cmd, {shell: true})
        sp.ports[msg.port].isRebooting = true
        bin.stdout.on('data', function (data) {
            try {
                jsonContent = JSON.parse(data);
            } catch (e) {
                console.error(e);
            }
            console.log(`port_off_busy: ` + msg.port)
            io.sockets.emit('device_off_busy', {port: msg.port})
        });
        bin.on('close', () => {
            sp.ports[msg.port].isRebooting = true
        })
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

async function getCoords() {
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


