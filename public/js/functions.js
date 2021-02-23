var p1c, p2c, p3c, p4c, i1, timeout;
let hostfield = document.querySelector('#hostname');
let tempfield = document.querySelector('#temp');
let wattField = document.querySelector('#totWatts');
let locationField = document.querySelector('#location');
let p1vfield = document.querySelector('#p1v');
let p1cfield = document.querySelector('#p1c');
let p2vfield = document.querySelector('#p2v');
let p2cfield = document.querySelector('#p2c');
let p3vfield = document.querySelector('#p3v');
let p3cfield = document.querySelector('#p3c');
let p4vfield = document.querySelector('#p4v');
let p4cfield = document.querySelector('#p4c');


let p1IpField = document.querySelector('#p1ip');
let p2IpField = document.querySelector('#p2ip');
let p3IpField = document.querySelector('#p3ip');
let p4IpField = document.querySelector('#p4ip');


let p1OnBtn = document.querySelector('#p1on');
let p2OnBtn = document.querySelector('#p2on');
let p3OnBtn = document.querySelector('#p3on');
let p4OnBtn = document.querySelector('#p4on');
let p1OffBtn = document.querySelector('#p1off');
let p2OffBtn = document.querySelector('#p2off');
let p3OffBtn = document.querySelector('#p3off');
let p4OffBtn = document.querySelector('#p4off');
let editButton = document.querySelector('.edit');
let portInfo = "";

let c1EditBtn = document.querySelector('#c1edit');
let serverAddress = '';
let streamAddress = '';
if (window.location.host.indexOf('127.0.0.1') > -1) {
    serverAddress = "127.0.0.1:3001";
    streamAddress = "127.0.0.1:3002";
} else {
    serverAddress = '166.161.225.29:3001';
    streamAddress = '166.161.225.29:3002';
}


let pauseGui = false;
(function connect() {
    $(".loading-modal").modal('hide');

    let socket = io({reconnectionDelayMax: 10000});

    const tMin = 5000;
    const tMax = 8000;

    //timeout = funInterval(socket);

    function funInterval(socket) {
        var interval = getRandomInt(tMin, tMax);
        console.log(`Your Timeout is: ` + interval);
        i1 = setInterval(function (socket) {
            socket.emit('update', '');
        }, interval, socket);
        return interval;
    }

    function changeInterval(socket) {
        clearInterval(i1);
        return funInterval(socket);
    }

    socket.on('receive_watt', data => {
        //console.log(data)
        wattField.textContent = parseFloat(data.watts).toPrecision(3) + ` W`
    })

    socket.on('update_srv', data => {
        socket.emit('update','');
    })

    socket.on('receive_temp', data => {
        //console.log(data)
        if (data.temp == "N/A") {
            timeout = changeInterval(socket);
            //socket.emit('update', '');
            console.log(`NEW TIMEOUT: ` + timeout);
        }
        tempfield.innerHTML = data.temp + '&deg;F'
    })

    socket.on('receive_p1v', data => {
        p1vfield.innerHTML = parseFloat(data.p1v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p1v) > 0) {
            $("#p1").removeClass("text-muted")
                .removeClass("blink")
                .removeClass("text-warning")
                .addClass("fas")
                .removeClass("fal")
                .addClass("text-secondary");
            if (p1c > 0) {
                $("#p1on").toggleClass("active", true);
                $("#p1off").toggleClass("active", false);
            }
        } else {
            if (p1c > 0) { /* If Voltage is 0 and there is a current */
                console.log(`error p1`);
                $("#p1").removeClass("text-muted")
                    .addClass("text-warning")
                    .addClass("blink");

                /* Should probably indicate that the port is not getting a voltage */
                /* Maybe turn the port on but this should be handled by the server */
            } else {
                $("#p1").addClass("text-muted")
                    .removeClass("fas")
                    .addClass("fal")
                    .removeClass("text-secondary blink");

            }
            $("#p1on").toggleClass("active", false);
            $("#p1off").toggleClass("active", true);
        }
    })

    socket.on('receive_p1c', data => {
        p1c = parseFloat(data.p1c);
        p1cfield.innerHTML = p1c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_p2v', data => {
        p2vfield.innerHTML = parseFloat(data.p2v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p2v) > 0) {
            $("#p2").removeClass("text-muted").removeClass("blink").removeClass("text-warning").addClass("text-secondary");
            if (p2c > 0) {
                $("#p2on").toggleClass("active", true);
                $("#p2off").toggleClass("active", false);
            }
        } else {
            if (p2c > 0) {
                console.log(`error p2`);
                $("#p2").removeClass("text-muted").addClass("text-warning").addClass("blink");

            } else {
                $("#p2").addClass("text-muted").removeClass("text-secondary blink");
            }
            $("#p2on").toggleClass("active", false);
            $("#p2off").toggleClass("active", true);
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
            $("#p3").removeClass("text-muted").removeClass("blink").removeClass("text-warning").addClass("text-secondary");
            if (p3c > 0) {
                $("#p3on").toggleClass("active", true);
                $("#p3off").toggleClass("active", false);
            }
        } else {
            if (p3c > 0) {
                console.log(`error p3`);
                $("#p3").removeClass("text-muted").addClass("text-warning").addClass("blink");

            } else {
                $("#p3").addClass("text-muted").removeClass("text-secondary").removeClass("text-warning").removeClass("blink");
            }
            $("#p3on").toggleClass("active", false);
            $("#p3off").toggleClass("active", true);
        }
    })

    socket.on('receive_p3c', data => {
        p3c = parseFloat(data.p3c)
        p3cfield.innerHTML = p3c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_p4v', data => {
        p4vfield.innerHTML = parseFloat(data.p4v).toPrecision(4) + '&nbsp;V'
        if (parseFloat(data.p4v) > 0) {
            $("#p4").removeClass("text-muted").removeClass("blink").removeClass("text-warning").addClass("text-secondary");
            if (p4c > 0) {
                $("#p4on").toggleClass("active", true);
                $("#p4off").toggleClass("active", false);
            }
        } else {
            if (p4c > 0) {
                console.log(`error p4`);
                $("#p4").toggleClass("text-muted", false)
                    .toggleClass("text-warning blink", true);
            } else {
                $("#p4").toggleClass("text-muted", true)
                    .toggleClass("text-secondary text-warning blink", true);
            }
            $("#p4on").toggleClass("active", false);
            $("#p4off").toggleClass("active", true);
        }
    })

    socket.on('receive_p4c', data => {
        p4c = parseFloat(data.p4c)
        p4cfield.innerHTML = p4c.toPrecision(4) + '&nbsp;mA'
    })

    socket.on('receive_log', data => {
        console.log(data)
    })

    socket.on('device_on_busy', data => {
        console.log(`port_on, ` + data.port)
        socket.emit('port_on', {port: data.port})
    })

    socket.on('device_off_busy', data => {
        console.log(`port_off, ` + data.port)
        socket.emit('port_off', {port: data.port})
    })

    socket.on('pingOut', data => {
        $('#pingout').text(data.toString());
    })

    socket.on('receive_location', data => {
        locationField.innerHTML = data
    })

    socket.on('receive_coords', data => {
        portInfo = data;
        let gpslink = `http://maps.google.com/maps?q=${portInfo.lat},${portInfo.lon}`
        if (portInfo.lat != '' || portInfo.lat.length > 0 || portInfo.lon != '' || portInfo.lon.length > 0) {
            $('#gpslink').html("<a href='" + gpslink + "' target='_blank'>" + portInfo.lat.toFixed(6) + ", " + portInfo.lon.toFixed(6) + "</a>")
                .removeClass('text-danger');

        } else {
            $('#gpslink').html('GPS Signal Lost...')
                .addClass('text-danger');
            socket.emit('get_coords', '');
        }
    })

    socket.on('receive_update', data => {
        let login = getCookie('login');
        $("#loadMe").modal('hide');
        portInfo = data;
        let loginPrompt = '';
        if (!login || (login == null || login == "")) {
            do {
                loginPrompt = prompt('Please Enter Password: ');
            } while (loginPrompt == null || loginPrompt == "");

            var md5 = $.md5(loginPrompt);

            if (md5 !== portInfo.pin) {
                window.location.replace("/401");
            } else {
                console.log(`${md5} == ${portInfo.pin} ---> LOGIN OK`);
                login = true;
                setCookie('login', 'true', 0.041667); //1hr
            }
        }
        if(!pauseGui) {
            let p1 = portInfo.ports[0];
            let p2 = portInfo.ports[1];
            let p3 = portInfo.ports[2];
            let p4 = portInfo.ports[3];
            p1vfield.innerHTML = parseFloat(p1.voltage).toPrecision(4) + '&nbsp;V'
            p2vfield.innerHTML = parseFloat(p2.voltage).toPrecision(4) + '&nbsp;V'
            p3vfield.innerHTML = parseFloat(p3.voltage).toPrecision(4) + '&nbsp;V'
            p4vfield.innerHTML = parseFloat(p4.voltage).toPrecision(4) + '&nbsp;V'
            let p1Icon = document.querySelector('#p1');
            let p2Icon = document.querySelector('#p2');
            let p3Icon = document.querySelector('#p3');
            let p4Icon = document.querySelector('#p4');
            hostfield.textContent = portInfo.hostname
            p1cfield.innerHTML = parseFloat(p1.current).toPrecision(4) + '&nbsp;mA';
            p2cfield.innerHTML = parseFloat(p2.current).toPrecision(4) + '&nbsp;mA';
            p3cfield.innerHTML = parseFloat(p3.current).toPrecision(4) + '&nbsp;mA';
            p4cfield.innerHTML = parseFloat(p4.current).toPrecision(4) + '&nbsp;mA';

            $('#p1w').html(parseFloat(p1.watts).toFixed(2) + '&nbsp;W');
            $('#p2w').html(parseFloat(p2.watts).toFixed(2) + '&nbsp;W');
            $('#p3w').html(parseFloat(p3.watts).toFixed(2) + '&nbsp;W');
            $('#p4w').html(parseFloat(p4.watts).toFixed(2) + '&nbsp;W');

            p1IpField.innerHTML = p1.ipv4
            p2IpField.innerHTML = p2.ipv4
            p3IpField.innerHTML = p3.ipv4
            p4IpField.innerHTML = p4.ipv4

            locationField.innerHTML = portInfo.location;
            $('#version').html(portInfo.version);

            if (portInfo.temp == "N/A") {
                //timeout = changeInterval(socket);
                socket.emit('update', '');
                //console.log(`NEW TIMEOUT: ` + timeout);
            }

            tempfield.innerHTML = data.temp + '&deg;F';
            wattField.textContent = parseFloat(data.totalWatts).toPrecision(3) + ` W`;
            let d = new Date().getTime();
            portInfo.ports[0].camUrl = `http://${streamAddress}/cam/${p1.ipv4}/u/${p1.user}/p/${p1.pass}?${d}`;
            portInfo.ports[1].camUrl = `http://${streamAddress}/cam/${p2.ipv4}/u/${p2.user}/p/${p2.pass}?${d}`;
            portInfo.ports[2].camUrl = `http://${streamAddress}/cam/${p3.ipv4}/u/${p3.user}/p/${p3.pass}?${d}`;
            portInfo.ports[3].camUrl = `http://${streamAddress}/cam/${p4.ipv4}/u/${p4.user}/p/${p4.pass}?${d}`;

            portInfo.ports[0].streamUrl = `ws://${streamAddress}/live/${p1.ipv4}/u/${p1.user}/p/${p1.pass}`;
            portInfo.ports[1].streamUrl = `ws://${streamAddress}/live/${p2.ipv4}/u/${p2.user}/p/${p2.pass}`;
            portInfo.ports[2].streamUrl = `ws://${streamAddress}/live/${p3.ipv4}/u/${p3.user}/p/${p3.pass}`;
            portInfo.ports[3].streamUrl = `ws://${streamAddress}/live/${p4.ipv4}/u/${p4.user}/p/${p4.pass}`;

            if (p1.ipv4enabled) {
                if (p1.isRebooting) {
                    $('#cam1').attr('src', 'img/img404.png')
                } else {
                    $("#cam1").on("error", imgError)
                        .on("load", function () {
                            $(this).removeClass('disabled');
                        })
                        .attr('src', portInfo.ports[0].camUrl);
                }
            }
            if (p2.ipv4enabled) {
                if (p2.isRebooting) {
                    $('#cam2').attr('src', 'img/img404.png')
                } else {
                    $("#cam2").on("error", imgError)
                        .on("load", function () {
                            $(this).removeClass('disabled');
                        })
                        .attr('src', portInfo.ports[1].camUrl);
                }
            }
            if (p3.ipv4enabled) {
                if (p3.isRebooting) {
                    $('#cam3').attr('src', 'img/img404.png')
                } else {
                    $("#cam3").on("error", imgError)
                        .on("load", function () {
                            $(this).removeClass('disabled');
                        })
                        .attr('src', portInfo.ports[2].camUrl);
                }
            }
            if (p4.ipv4enabled) {
                if (p4.isRebooting) {
                    $('#cam4').attr('src', 'img/img404.png')
                } else {
                    $("#cam4").on("error", imgError)
                        .on("load", function () {
                            $(this).removeClass('disabled');
                        })
                        .attr('src', portInfo.ports[3].camUrl);
                }
            }

            try {
                let gpslink = `http://maps.google.com/maps?q=${portInfo.lat},${portInfo.lon}`
                if (portInfo.lat != '' || portInfo.lat.length > 0 || portInfo.lon != '' || portInfo.lon.length > 0) {
                    $('#gpslink').html("<a href='" + gpslink + "' target='_blank'>" + portInfo.lat.toFixed(6) + ", " + portInfo.lon.toFixed(6) + "</a>")
                        .removeClass('text-danger');

                } else {
                    $('#gpslink').html('GPS Signal Lost...')
                        .addClass('text-danger');
                    throw 'Lost GPS';
                }
            } catch (e) {
                console.log(e);
                setTimeout(socket.emit('get_coords', ''), 15000);
            }
            //stream1 = 'ws://127.0.0..1:3001/live/'+ p1.ipv4 +'/u/'+ p1.user +'/p/'+ p1.pass + '';

            guiUpdate(p1Icon, p1OnBtn, p1OffBtn, p1);
            guiUpdate(p2Icon, p2OnBtn, p2OffBtn, p2);
            guiUpdate(p3Icon, p3OnBtn, p3OffBtn, p3);
            guiUpdate(p4Icon, p4OnBtn, p4OffBtn, p4);

            if (!portInfo.ports[0].ipv4enabled) {
                $('#cam1').toggleClass('invisible', true);
            } else {
                $('#cam1').toggleClass('invisible', false);
            }
            if (!portInfo.ports[1].ipv4enabled) {
                $('#cam2').toggleClass('invisible', true);
            } else {
                $('#cam2').toggleClass('invisible', false);
            }
            if (!portInfo.ports[2].ipv4enabled) {
                $('#cam3').toggleClass('invisible', true);
            } else {
                $('#cam3').toggleClass('invisible', false);
            }
            if (!portInfo.ports[3].ipv4enabled) {
                $('#cam4').toggleClass('invisible', true);
            } else {
                $('#cam4').toggleClass('invisible', false);
            }
            let gpslink = `http://maps.google.com/maps?q=${portInfo.lat},${portInfo.lon}`
            if (portInfo.lat != '' || portInfo.lat.length > 0 || portInfo.lon != '' || portInfo.lon.length > 0) {
                $('#gpslink').html("<a href='" + gpslink + "' target='_blank'>" + portInfo.lat.toFixed(6) + ", " + portInfo.lon.toFixed(6) + "</a>")
                    .removeClass('text-danger');

            } else {
                $('#gpslink').html('GPS Signal Lost...')
                    .addClass('text-danger');
                socket.emit('get_coords', '');
            }
        }
    })


    /**********
     * BUTTONS *
     **********/

    $('#pingSubmit').on("click", function () {
        socket.emit('ping', $('#pingAdd').val());
    });

    p1OnBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');
        //clearInterval(i1)
        pauseGui = true;
        if (parseFloat(portInfo.ports[0].voltage) < 1) {
            socket.emit('port_on', {port: 0})
        }
        //timeout = funInterval(socket)
        pauseGui = false;

    })
    p2OnBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');

        pauseGui = true;
        if (parseFloat(portInfo.ports[1].voltage) < 1) {
            socket.emit('port_on', {port: 1})
        }
        pauseGui = false;
    })
    p3OnBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');

        pauseGui = true;
        if (parseFloat(portInfo.ports[2].voltage) < 1) {
            socket.emit('port_on', {port: 2})
        }
        pauseGui = false;
    })
    p4OnBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');
        //clearInterval(i1)
        pauseGui = true
        if (parseFloat(portInfo.ports[3].voltage) < 1) {
            socket.emit('port_on', {port: 3})
        }
        pauseGui = false
        //timeout = funInterval(socket)
    })

    p1OffBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');
        //clearInterval(i1)
        pauseGui = true;
        socket.emit('port_off', {port: 0})
        //timeout = funInterval(socket)
        pauseGui = false;
    })
    p2OffBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');
        //clearInterval(i1)
        pauseGui = true;
        socket.emit('port_off', {port: 1})
        //timeout = funInterval(socket)
        pauseGui = false;
    })
    p3OffBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');
        //clearInterval(i1)
        pauseGui = true;
        socket.emit('port_off', {port: 2})
        pauseGui = false;
        //timeout = funInterval(socket)
    })
    p4OffBtn.addEventListener('click', e => {
        $("#loadMe").modal('show');
        //clearInterval(i1)
        pauseGui = true;
        socket.emit('port_off', {port: 3})
        //timeout = funInterval(socket)
        pauseGui = false;
    })

    $('#c1edit').on("click", function () {
        updateModals();
        $("#cam1settings").modal('show');
    });

    $('#c1save').on("click", function () {
        if ($('#c1ip').val().toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) == null) {
            alert('invalid IP address');
            return;
        } else if ($('#c3u').val().length < 1 || $('#c3p').val().length < 1) {
            alert('Username/Password cannot be blank.')
            return;
        } else {
            socket.emit('set_p1state', $('#c1state').prop('checked'));
            socket.emit('set_p1ip', $('#c1ip').val());
            socket.emit('set_p1u', $('#c1u').val());
            socket.emit('set_p1p', $('#c1p').val());
            $("#cam1settings").modal('hide');

        }
    });

    $('#c2edit').on("click", function () {
        updateModals();
        $("#cam2settings").modal('show');
    });

    $('#c2save').on("click", function () {

        if ($('#c2ip').val().toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) == null) {
            alert('invalid IP address');
            return;
        } else if ($('#c2u').val().length < 1 || $('#c2p').val().length < 1) {
            alert('Username/Password cannot be blank.')
            return;
        } else {
            console.log('ok');
            socket.emit('set_p2state', $('#c2state').prop('checked'))
                .emit('set_p2ip', $('#c2ip').val())
                .emit('set_p2u', $('#c2u').val())
                .emit('set_p2p', $('#c2p').val());
            $("#cam2settings").modal('hide');

        }
    });


    $('#c3edit').on("click", function () {
        updateModals();
        $("#cam3settings").modal('show');
    });

    $('#c3save').on("click", function () {

        if ($('#c3ip').val().toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) == null) {
            alert('invalid IP address');
            return;
        } else if ($('#c3u').val().length < 1 || $('#c3p').val().length < 1) {
            alert('Username/Password cannot be blank.')
            return;
        } else {
            socket.emit('set_p3state', $('#c3state').prop('checked'));
            socket.emit('set_p3ip', $('#c3ip').val());
            socket.emit('set_p3u', $('#c3u').val());
            socket.emit('set_p3p', $('#c3p').val());
            $("#cam3settings").modal('hide');

        }
    });


    $('#c4edit').on("click", function () {
        updateModals();
        $("#cam4settings").modal('show');
    });

    $('#c4save').on("click", function () {
        if ($('#c4ip').val().toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) == null) {
            alert('invalid IP address');
            return;
        } else if ($('#c4u').val().length < 1 || $('#c4p').val().length < 1) {
            alert('Username/Password cannot be blank.')
            return;
        } else {
            socket.emit('set_p4state', $('#c4state').prop('checked'));
            socket.emit('set_p4ip', $('#c4ip').val());
            socket.emit('set_p4u', $('#c4u').val());
            socket.emit('set_p4p', $('#c4p').val());
            $("#cam4settings").modal('hide');
        }
    });

    $('#cam1settings').on('hide.bs.modal', function () {
        //timeout = funInterval(socket);
        pauseGui = false;
    })

    $('#cam1live').on('hide.bs.modal', function () {
        //timeout = funInterval(socket);
        pauseGui = false;

    })

    $('#cam2settings').on('hide.bs.modal', function () {
        // timeout = funInterval(socket);
        pauseGui = false;

    })

    $('#cam2live').on('hide.bs.modal', function () {
        // timeout = funInterval(socket);
        pauseGui = false;
    })

    $('#cam3settings').on('hide.bs.modal', function () {
        // timeout = funInterval(socket);
        pauseGui = false;

    })

    $('#cam3live').on('hide.bs.modal', function () {
        // timeout = funInterval(socket);
        pauseGui = false;
    })

    $('#cam4settings').on('hide.bs.modal', function () {
        // timeout = funInterval(socket);
        pauseGui = false;
    })

    $('#cam4live').on('hide.bs.modal', function () {
        //timeout = funInterval(socket);
        pauseGui = false;

    })

    $('#loginmodal').on('hide.bs.modal', function () {
        // timeout = funInterval(socket);
        pauseGui = false;
    })

    /**
     * REBOOT BUTTONS
     */

    $('#p1, #p1alt').on('click', function (event) {
        event.stopPropagation();
        //portInfo.ports[0].isRebooting = true;
        //clearInterval(i1)
        pauseGui = true;
        $('#p1').toggleClass('blink', true);
        $('#cam1').attr('src', 'img/reboot.png');
        $('#loadMe').modal('show');
        socket.emit('port_off', {port: 0});
        setTimeout(function () {
            socket.emit('port_on', {port: 0});
            $('#p1').toggleClass('blink', false);
            $('#loadMe').modal('hide');
            //portInfo.ports[0].isRebooting = false;
            //timeout = funInterval(socket);
            pauseGui = false;
            //window.location.reload(true);
        }, 10000);

    });

    $('#p2, #p2alt').on('click', function () {
        //clearInterval(i1)
        pauseGui = true;

        $('#p2').toggleClass('blink', true);
        $('#cam2').attr('src', 'img/reboot.png');
        $('#loadMe').modal('show');
        socket.emit('port_off', {port: 1});
        setTimeout(function () {
            socket.emit('port_on', {port: 1});
            $('#p2').toggleClass('blink', false);
            $('#loadMe').modal('hide');
            //timeout = funInterval(socket);
            pauseGui = false;
            //window.location.reload(true);

        }, 10000);
    });

    $('#p3, #p3alt').on('click', function () {
        //clearInterval(i1)
        pauseGui = true;

        $('#p3').toggleClass('blink', true);
        $('#cam3').attr('src', 'img/reboot.png');
        $('#loadMe').modal('show');
        socket.emit('port_off', {port: 2});
        setTimeout(function () {
            socket.emit('port_on', {port: 2});
            $('#p3').toggleClass('blink', false);
            $('#loadMe').modal('hide');
           // timeout = funInterval(socket);
            pauseGui = false;

            // window.location.reload(true);
        }, 10000);
    });


    $('#p4, #p4alt').on('click', function () {
       // clearInterval(i1)
        pauseGui = true;

        $('#p4').toggleClass('blink', true);
        $('#cam4').attr('src', 'img/reboot.png');
        $('#loadMe').modal('show');
        socket.emit('port_off', {port: 3});
        setTimeout(function () {
            socket.emit('port_on', {port: 3});
            $('#p4').toggleClass('blink', false);
            $('#loadMe').modal('hide');
            //timeout = funInterval(socket);
            pauseGui = false;

            // window.location.reload(true);
        }, 10000);
    });


    $(".edit").click(function (e) {
        e.stopPropagation();
        //clearInterval(i1)
        pauseGui = true;
        let editable = $(this).prev('span').attr('contenteditable');
        if (editable) {
            let i = $(this).prev().attr('id').replace("#", "");
            socket.emit('set_' + i, $(this).prev('span').html());

            $(this).removeClass('fa-save')
                .addClass('fa-pencil');
            $(this).prev('span')
                .removeAttr('contenteditable')
                .removeClass('border border-success');
            //timeout = funInterval(socket)
            pauseGui = false;

        } else {
            $(this).removeClass('fa-pencil')
                .addClass('fa-save');
            $(this).prev('span')
                .attr('contenteditable', 'true')
                .addClass('border border-success')
                .focus();
        }

    });

    $('#cam1').on("click", function () {
        if ($(this).hasClass('disabled') == false) {
            //clearInterval(i1)
            pauseGui = true;
            //socket.emit('restart_stream',{ stream: 0 });
            //var streamstring  = 'ws://192.168.1.170:3001/live/'+ p1.ipv4 +'/u/' + p1.user + '/p/'+ p1.pass;
            loadPlayer({
                url: portInfo.ports[0].streamUrl,
                canvas: document.getElementById('cam1canvas'),
                audio: false,
                videoBufferSize: 512 * 1024
            })
            $('#cam1live').modal('show');
        }
    });

    $('#cam2').on("click", function () {
        if ($(this).hasClass('disabled') == false) {
            //clearInterval(i1)
            pauseGui = true;
            loadPlayer({
                url: portInfo.ports[1].streamUrl,
                canvas: document.getElementById('cam2canvas'),
                audio: false,
                videoBufferSize: 512 * 1024
            })
            $('#cam2live').modal('show');
        }
    });

    $('#cam3').on("click", function () {
        if ($(this).hasClass('disabled') == false) {
            //clearInterval(i1)
            pauseGui = true;
            loadPlayer({
                url: portInfo.ports[2].streamUrl,
                canvas: document.getElementById('cam3canvas'),
                audio: false,
                videoBufferSize: 512 * 1024
            })
            $('#cam3live').modal('show');
        }
    });

    $('#cam4').on("click", function () {
        if ($(this).hasClass('disabled') == false) {
            //clearInterval(i1)
            pauseGui = true;
            loadPlayer({
                url: portInfo.ports[3].streamUrl,
                canvas: document.getElementById('cam4canvas'),
                audio: false,
                videoBufferSize: 512 * 1024
            })
            $('#cam4live').modal('show');
        }
    });

    $('#setpassword').on("click", function () {
        //clearInterval(i1)
        pauseGui = true
        $('#loginmodal').modal('show');
    });

    $('#newpass').on("click", function () {
        let a = $('#login');
        if (a.val() == null || a.val() == "") {
            alert('Please Enter a password');
        } else {
            socket.emit('set_pin', $.md5(a.val()));
            $('#loginmodal').modal('hide');
        }
    });

    //console.log('ws://127.0.0..1:3001/live/'+ p1.ipv4 +'/u/'+ p1.user +'/p/'+ p1.pass + '');


})()

function updateModals() {
    let p1 = portInfo.ports[0];
    let p2 = portInfo.ports[1];
    let p3 = portInfo.ports[2];
    let p4 = portInfo.ports[3];

    if (p1.ipv4enabled) {
        /*        $('#cam1').toggleClass('invisible', false)
                    .fadeIn();*/
        $('#c1state').bootstrapToggle('on');
    } else {
        // $('#cam1').toggleClass('invisible', true);
        $('#c1state').bootstrapToggle('off');
    }
    $('#c1ip').val(p1.ipv4);
    $('#c1u').val(p1.user);
    $('#c1p').val(p1.pass);

    if (p2.ipv4enabled) {
        /*$('#cam2').toggleClass('invisible', false)
            .fadeIn();*/
        $('#c2state').bootstrapToggle('on');
    } else {
        //$('cam2').hide();
        /*        $('#cam2').toggleClass('invisible', true)
                    .fadeOut();*/
        $('#c2state').bootstrapToggle('off');
    }
    $('#c2ip').val(p2.ipv4);
    $('#c2u').val(p2.user);
    $('#c2p').val(p2.pass);

    if (p3.ipv4enabled) {
        /*       $('#cam3').toggleClass('invisible', false)
                   .fadeIn();*/
        $('#c3state').bootstrapToggle('on');
    } else {
        /*   $('#cam3').toggleClass('invisible', true)
               .fadeOut();*/
        $('#c3state').bootstrapToggle('off');
    }
    $('#c3ip').val(p3.ipv4);
    $('#c3u').val(p3.user);
    $('#c3p').val(p3.pass);


    if (p4.ipv4enabled) {
        /*$('#cam4').toggleClass('invisible', false)
            .fadeIn();*/
        $('#c4state').bootstrapToggle('on');
    } else {
        /*  $('#cam4').toggleClass('invisible', true)
              .fadeOut();*/
        $('#c4state').bootstrapToggle('off');
    }
    $('#c4ip').val(p4.ipv4);
    $('#c4u').val(p4.user);
    $('#c4p').val(p4.pass);

}

$(function () {
    $('[data-toggle="tooltip"]').tooltip();

    $('.cstate').parent().css("width", "100px");
    $('.toggle-on').removeClass('btn-primary').addClass('btn-secondary');
    $('.collapse').collapse({toggle: false});

    if (window.mobileCheck()) {
        $('#menu').removeClass('dropdown-menu-right')
            .addClass('dropdown-menu-left');
        /*$("<br><a href='#' id='p1alt'><small>REBOOT</small></a>").insertAfter("#p1");
        $("<br><a href='#' id='p2alt'><small>REBOOT</small></a>").insertAfter("#p2");
        $("<br><a href='#' id='p3alt'><small>REBOOT</small></a>").insertAfter("#p3");
        $("<br><a href='#' id='p4alt'><small>REBOOT</small></a>").insertAfter("#p4");*/
    } else {
        $('#menu').removeClass('dropdown-menu-left')
            .addClass('dropdown-menu-right');
    }

    /********
     * Events
     *********/
    $('img').error(function(){
        $(this).attr('src', 'img/img404.png').toggleClass('disabled', true);
    });
    $('#cam1').on("error", imgError);
    $('#cam2').on("error", imgError);
    $('#cam3').on("error", imgError);
    $('#cam4').on("error", imgError);


});

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

var myVar = setInterval(function () {
    myTimer();
}, 1000);

function myTimer() {
    let d = new Date();
    $("#systime").text(d.toLocaleTimeString());
}

function guiUpdate(iconField, onField, offField, sp) {
    if (parseFloat(sp.voltage) > 0) {
        $(iconField).removeClass("text-muted")
            .removeClass("blink")
            .removeClass("text-warning")
            .removeClass("fal")
            .addClass("fas")
            .addClass("text-secondary")
            .next('span').removeClass('invisible');
        if (sp.current > 0) {
            $(onField).toggleClass("active", true);
            $(offField).toggleClass("active", false);
        }
    } else {
        if (sp.current > 0) {
            $(iconField).removeClass("text-muted")
                .addClass("text-warning")
                .addClass("blink");

        } else {
            $(iconField).addClass("text-muted")
                .removeClass("text-secondary")
                .removeClass("text-warning")
                .removeClass("fas")
                .addClass("fal")
                .removeClass("blink")
                .next('span').addClass('invisible');
        }
        $(onField).toggleClass("active", false);
        $(offField).toggleClass("active", true);
    }

}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function imgError() {
    $(this).toggleClass('disabled', true);
}