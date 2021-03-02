const {spawn} = require("child_process")
const onvif = require('node-onvif');

process.on('message', (m) => {
    let result = ''
    switch (m.tool) {
        case 'pingtool':
            ping(m.ip)
            break
        case 'ptzmove':
            ptzMove(m.params)
            break
    }
})

function ping(data) {
    const isWin = process.platform === "win32";
    let options = [];
    if (isWin) {
        options = [`${data.toString()}`, '-n', '4']
    } else {
        options = [`${data.toString()}`, '-c', '4']
    }
    let ping = spawn(`ping`, options, {shell: true})

    let result = '';
    ping.stdout.on('data', function (out) {
        result += out + '';
    })

    ping.stderr.on('data', (e) => {
        //res.status(0)
        console.log(e.toString())
    })

    ping.on('close', function () {
        process.send({m: 'pingout', data: result})
    })
}

function ptzMove(params) {
    let move = params.speed
    let odevice = new onvif.OnvifDevice({
        xaddr: params.addr,
        user : params.user,
        pass : params.pass
    });

    odevice.init().then(() => {
        // Move the camera
        return odevice.ptzMove({
            'speed': move,
            'timeout': 1 // seconds
        });
    }).then(() => {
        console.log('Done!');
    }).catch((error) => {
        console.error(error);
    });
}