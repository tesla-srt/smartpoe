const {spawn} = require("child_process")
const updatecmd = "C:/Users/TBIAdmin/node/smartpoe/bin/aaeonSmartPOE.exe all"
const fs = require("fs");
let streamAddress = '166.161.225.29:3002';

process.on('message',  (message) => {
    let jsonData = '{}'

    let bin = spawn(updatecmd, {shell: true});
    bin.stderr.on('data', async function (data) {
        let foo = fs.readFileSync('bin/all.json', 'utf-8')
        try {
            console.log(`fallback: local file`)
            jsonData = foo
        } catch (e) {
            console.log('Fallback Failed');
        }

    });

    bin.stdout.on('data', async function (data) {
        try {
            jsonData = (data)
        } catch (ex) {
            console.log(ex)
        }
    });


    let config = message[1]
    let data = message[0]
    bin.on('close', async () => {
        let okay = false;
        let newData = await JSON.parse(jsonData)
        let port1 = data.ports[0];
        let port2 = data.ports[1];
        let port3 = data.ports[2];
        let port4 = data.ports[3];
        if (newData.temp != 'N/A') {
            try {
                data.temp = newData.temp;
                data.location = config.info.location;
                // data.version = config.info.version;
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
                port3.voltage = newData["p3"][0].voltage
                port3.current = newData["p3"][0].current

                port4.voltage = newData["p4"][0].voltage
                port4.current = newData["p4"][0].current


                port2.voltage = newData["p2"][0].voltage
                port2.current = newData["p2"][0].current


                port1.voltage = newData["p1"][0].voltage
                port1.current = newData["p1"][0].current
                let d = new Date().getTime();
                port1.camUrl = `http://${streamAddress}/cam/${port1.ipv4}/u/${port1.user}/p/${port1.pass}?${d}`;
                port2.camUrl = `http://${streamAddress}/cam/${port2.ipv4}/u/${port2.user}/p/${port2.pass}?${d}`;
                port3.camUrl = `http://${streamAddress}/cam/${port3.ipv4}/u/${port3.user}/p/${port3.pass}?${d}`;
                port4.camUrl = `http://${streamAddress}/cam/${port4.ipv4}/u/${port4.user}/p/${port4.pass}?${d}`;
                port1.streamUrl = `ws://${streamAddress}/live/${port1.ipv4}/u/${port1.user}/p/${port1.pass}`;
                port2.streamUrl = `ws://${streamAddress}/live/${port2.ipv4}/u/${port2.user}/p/${port2.pass}`;
                port3.streamUrl = `ws://${streamAddress}/live/${port3.ipv4}/u/${port3.user}/p/${port3.pass}`;
                port4.streamUrl = `ws://${streamAddress}/live/${port4.ipv4}/u/${port4.user}/p/${port4.pass}`;


                port1.watts = (port1.current / 1000) * port1.voltage;
                port2.watts = (port2.current / 1000) * port2.voltage;
                port3.watts = (port3.current / 1000) * port3.voltage;
                port4.watts = (port4.current / 1000) * port4.voltage;

                data.totalWatts = port1.watts + port2.watts + port3.watts + port4.watts;
                okay = true
            } catch (ex) {
                console.log(`Error: ${ex}`);
            }
        }
        if (okay) {
            console.log('update completed')
            process.send(data);
        }
    })


});