const {spawn} = require("child_process")

process.on('message', (m) => {
    let result = ''
    switch (m.tool) {
        case 'pingtool':
            ping(m.ip)
            break
    }
})

function ping(data) {
    const isWin = process.platform === "win32";
    let options = [];
    if (isWin) {
        options = [`${data.toString()}`, '-n', '3']
    } else {
        options = [`${data.toString()}`, '-c', '3']
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