(function connect(){
    let socket = io()
    let hostfield = document.querySelector('#hostname')
    let tempfield = document.querySelector('#temp')
    let wattField = document.querySelector('#totWatts')
    let p1vfield = document.querySelector('#p1v')
    let p1cfield = document.querySelector('#p1c')
    let p2vfield = document.querySelector('#p2v')
    let p2cfield = document.querySelector('#p2c')
    let p3vfield = document.querySelector('#p3v')
    let p3cfield = document.querySelector('#p3c')
    let p4vfield = document.querySelector('#p4v')
    let p4cfield = document.querySelector('#p4c')

    let p1OnBtn = document.querySelector('#p1on')
    let p2OnBtn = document.querySelector('#p2on')
    let p3OnBtn = document.querySelector('#p3on')
    let p4OnBtn = document.querySelector('#p4on')
    let p1OffBtn = document.querySelector('#p1off')
    let p2OffBtn = document.querySelector('#p2off')
    let p3OffBtn = document.querySelector('#p3off')
    let p4OffBtn = document.querySelector('#p4off')

    var p1c, p2c, p3c, p4c, i1, timeout;

    const tMin = 2000;
    const tMax = 6000;

    timeout = funInterval(socket);

    function funInterval(socket)
    {
        var interval =  getRandomInt(tMin,tMax);
       // console.log(`Your Timeout is: ` + interval);
        i1 = setInterval(function (socket) {
            socket.emit('update', '');
        }, interval, socket);
        return interval;
    }
    function changeInterval(socket)
    {
        clearInterval(i1);
        return funInterval(socket);
    }

    // clearInterval(i1);

    socket.emit('get_hostname', '');

    socket.on('receive_hostname', data => {
        //console.log(data)
        hostfield.textContent = data.hostname
    })

    socket.on('receive_watt', data => {
        //console.log(data)
        wattField.textContent = parseFloat(data.watts).toPrecision(4) + ` W`
    })

    socket.on('receive_temp', data => {
        //console.log(data)
        if (data.temp == "N/A") {
            timeout = changeInterval(socket);
            socket.emit('update', '');
            console.log(`NEW TIMEOUT: ` + timeout);

        }
        tempfield.innerHTML = data.temp + '&deg;F'
    })

    socket.on('receive_p1v', data => {
        p1vfield.innerHTML = parseFloat(data.p1v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p1v) > 0) {
            $("#p1").removeClass("text-muted").addClass("text-secondary");
            if (p1c > 0) {
                $("#p1on").toggleClass("active", true);
                $("#p1off").toggleClass("active", false);
            }
        } else {
            if (p1c > 0) { /* If Voltage is 0 and there is a current */
                console.log(`error p1`);
                /* Should probably indicate that the port is not getting a voltage */
                /* Maybe turn the port on but this should be handled by the server */
            }
            $("#p1on").toggleClass("active", false);
            $("#p1off").toggleClass("active", true);
            $("#p1").addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p1c', data => {
        p1c = parseFloat(data.p1c);
        p1cfield.innerHTML = p1c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_p2v', data => {
        p2vfield.innerHTML = parseFloat(data.p2v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p2v) > 0) {
            $("#p2").removeClass("text-muted").addClass("text-secondary");
            if (p2c > 0) {
                $("#p2on").toggleClass("active", true);
                $("#p2off").toggleClass("active", false);
            }
        } else {
            if (p2c > 0) {
                console.log(`error p2`);
            }
            $("#p2on").toggleClass("active", false);
            $("#p2off").toggleClass("active", true);

            $("#p2").addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p2c', data => {
        p2c = parseFloat(data.p2c)
        p2cfield.innerHTML = p2c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_p3v', data => {
        //console.log(data)

        p3vfield.innerHTML = parseFloat(data.p3v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p3v) > 0) {
           $("#p3").removeClass("text-muted").addClass("text-secondary");
            if (p3c > 0) {
                $("#p3on").toggleClass("active", true);
                $("#p3off").toggleClass("active", false);
            }
        } else {
            if (p3c > 0) {
                console.log(`error p3`);
            }
            $("#p3on").toggleClass("active", false);
            $("#p3off").toggleClass("active", true);
            $("#p3").addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p3c', data => {
        p3c = parseFloat(data.p3c)
        p3cfield.innerHTML = p3c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_p4v', data => {
        p4vfield.innerHTML = parseFloat(data.p4v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p4v) > 0) {
            $("#p4").removeClass("text-muted").addClass("text-secondary");
            if (p4c > 0) {
                $("#p4on").toggleClass("active", true);
                $("#p4off").toggleClass("active", false);
            }
        } else {
            if (p4c > 0) {
                console.log(`error p4`);
            }
            $("#p4on").toggleClass("active", false);
            $("#p4off").toggleClass("active", true);
            $("#p4").addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p4c', data => {
        p4c = parseFloat(data.p4c)
        p4cfield.innerHTML = p4c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_log', data => {
        console.log(data.message)
    })

    socket.on('device_on_busy', data => {
        console.log(`port_on, ` + data.port)
        socket.emit('port_on', {port: data.port})
    })

    socket.on('device_off_busy', data => {
        console.log(`port_off, ` + data.port)
        socket.emit('port_off', {port: data.port})
    })

    p1OnBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_on', {port: 0})
        timeout = funInterval(socket)
    })
    p2OnBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_on', {port: 1})
        timeout = funInterval(socket)
    })
    p3OnBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_on', {port: 2})
        timeout = funInterval(socket)
    })
    p4OnBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_on', {port: 3})
        timeout = funInterval(socket)
    })
    p1OffBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_off', {port: 0})
        timeout = funInterval(socket)
    })
    p2OffBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_off', {port: 1})
        timeout = funInterval(socket)
    })
    p3OffBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_off', {port: 2})
        timeout = funInterval(socket)
    })
    p4OffBtn.addEventListener('click', e => {
        clearInterval(i1)
        socket.emit('port_off', {port: 3})
        timeout = funInterval(socket)
    })

})()

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var myVar = setInterval(function() {
    myTimer();
}, 1000);

function myTimer() {
    var d = new Date();
    document.getElementById("systime").innerHTML = d.toLocaleTimeString();
}