(function connect(){
    let socket = io()

    let hostfield = document.querySelector('#hostname')
    let tempfield = document.querySelector('#temp')
    socket.on('receive_hostname', data => {
        console.log(data)
        hostfield.textContent = data.message
    })

    socket.on('receive_temp', data => {
        console.log(data)
        tempfield.textContent = data.message
    })

	socket.emit('get_hostname', '');
	socket.emit('get_temp', '');
})()