const {Curl} = require('node-libcurl');
const CurlAuth = require("node-libcurl").CurlAuth;
const CurlFeature = require("node-libcurl").CurlFeature;
let base64 = require('base-64');
var fs = require("fs");


process.on('message', async (message) => {
    let src = message[0]
    let user = message[1]
    let pass = message[2]
    let result = ''
    let curl = new Curl();
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
            let buffer = Buffer.from(body).toString('base64')
            result = buffer
            curl.close();
        })
        .on('error', function (e) {
            //res.status(404);
            let buffer = Buffer.from(fs.readFileSync('public/img/img404.png', 'utf-8')).toString('base64')
            result = buffer
            //res.send('poo');
            curl.close();
        })
        .perform();

    // send response to master process
    process.send({ b64: `${result}` });
});