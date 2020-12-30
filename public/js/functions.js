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
        tempfield.innerHTML = data.message + '&#176;F'
    })

	socket.emit('get_hostname', '');
	var interval = setInterval(function(socket) {
  		socket.emit('get_temp', '');
	}, 1500, socket);

	//clearInterval(interval);
})()

function getTemp(socket) {
	socket.emit('get_temp', '')
}