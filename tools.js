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
        case 'ptzhome':
            ptzHome(m.params)
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

async function ptzMove(params) {
    let move = params.speed
    let odevice = await new onvif.OnvifDevice({
        xaddr: 'http://' + params.addr + '/onvif/device_service',
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

    }).catch((error) => {
        console.error(error);
    });
}

async function ptzHome(options) {
    let odevice = await new onvif.OnvifDevice({
        xaddr: 'http://' + options.addr + '/onvif/device_service',
        user : options.user,
        pass : options.pass
    });

    odevice.init().then(() => {
        // The OnvifServicePtz object
        let ptz = odevice.services.ptz;
        if(!ptz) {
            throw new Error('Your ONVIF network camera does not support the PTZ service.');
        }
        // The parameters for the gotoHomePosition() method
        let profile = odevice.getCurrentProfile();
        let params = {
            'ProfileToken': profile['token'],
            'Speed'       : 1
        };
        // Send the GotoHomePosition command using the gotoHomePosition() method
        return ptz.gotoHomePosition(params);
    }).then((result) => {
        console.log(JSON.stringify(result.data, null, '  '));
    }).catch((error) => {
        console.error(error);
    });
}