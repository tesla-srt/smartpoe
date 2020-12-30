(function connect(){
    let socket = io()

    let hostfield = document.querySelector('#hostname')

    socket.on('receive_hostname', data => {
        console.log(data)
        hostfield.textContent = data.message
    })

	socket.emit('get_hostname', '');
})()