(function connect(){
    let socket = io()

    let hostfield = document.querySelector('#hostname')
    let tempfield = document.querySelector('#temp')
    let p1icon = document.querySelector('#p1')
    let p2icon = document.querySelector('#p2')
    let p3icon = document.querySelector('#p3')
    let p4icon = document.querySelector('#p4')
    let p1vfield = document.querySelector('#p1v')
    let p1cfield = document.querySelector('#p1c')
    let p2vfield = document.querySelector('#p2v')
    let p2cfield = document.querySelector('#p2c')
    let p3vfield = document.querySelector('#p3v')
    let p3cfield = document.querySelector('#p3c')
    let p4vfield = document.querySelector('#p4v')
    let p4cfield = document.querySelector('#p4c')

    socket.on('receive_hostname', data => {
        console.log(data)
        hostfield.textContent = data.message
    })

    socket.on('receive_temp', data => {
        console.log(data)
        tempfield.innerHTML = data.message + '&deg;F'
    })

    socket.on('receive_p1v', data => {
        console.log(data)
        p1vfield.innerHTML = data.message + '&nbsp;V'
        if (parseFloat(data.message) > 0) {
            p1icon.removeClass("text-muted").addClass("text-secondary");
        } else {
            p1icon.addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p1c', data => {
        console.log(data)
        p1cfield.innerHTML = data.message + '&nbsp;mA'
    })

    socket.on('receive_p2v', data => {
        console.log(data)
        p2vfield.innerHTML = data.message + '&nbsp;V'
        if (parseFloat(data.message) > 0) {
            p2icon.removeClass("text-muted").addClass("text-secondary");
        } else {
            p2icon.addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p2c', data => {
        console.log(data)
        p2cfield.innerHTML = data.message + '&nbsp;mA'
    })

    socket.on('receive_p3v', data => {
        console.log(data)
        p3vfield.innerHTML = data.message + '&nbsp;V'
        if (parseFloat(data.message) > 0) {
            p3icon.removeClass("text-muted").addClass("text-secondary");
        } else {
            p3icon.addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p3c', data => {
        console.log(data)
        p3cfield.innerHTML = data.message + '&nbsp;mA'
    })

    socket.on('receive_p4v', data => {
        console.log(data)
        p4vfield.innerHTML = data.message + '&nbsp;V'
        if (parseFloat(data.message) > 0) {
            p4icon.removeClass("text-muted").addClass("text-secondary");
        } else {
            p4icon.addClass("text-muted").removeClass("text-secondary");
        }
    })

    socket.on('receive_p4c', data => {
        console.log(data)
        p4cfield.innerHTML = data.message + '&nbsp;mA'
    })


	socket.emit('get_hostname', '');
    //socket.emit('get_p1v', '');
    //socket.emit('get_p2v', '');
    //socket.emit('get_p3v', '');
    //socket.emit('get_p4v', '');
	var i1 = setInterval(function(socket) {
  		socket.emit('get_temp', '');
	}, 1000, socket);
	var i2 = setInterval(function(socket) {
  		socket.emit('get_p1v', '');
	}, 1555, socket);

    var i3 = setInterval(function(socket) {
        socket.emit('get_p2v', '');
    }, 2000, socket);

    var i4 = setInterval(function(socket) {
        socket.emit('get_p3v', '');
    }, 2150, socket);

    var i5 = setInterval(function(socket) {
        socket.emit('get_p4v', '');
    }, 2250, socket);



	//clearInterval(interval);
})()