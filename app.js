const express = require('express')
const socketio = require('socket.io')
const { exec } = require("child_process");
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("server is running")
})

//initialize socket for the server
const io = socketio(server)

io.on('connection', socket => {
    console.log("New user connected")

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
            console.log(`stdout: ${stdout}`);
            io.sockets.emit('receive_hostname', {message: `${stdout}`})
        });
    })

    socket.on('get_temp', data => {
        exec("/bin/aaeonSmartPoe.exe temp && cat temperature.txt", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            io.sockets.emit('receive_temp', {message: `${stdout}`})
        });
    })

})
