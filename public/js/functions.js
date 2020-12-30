(function connect(){
    let socket = io.connect('http://127.0.0.1:3000')

    let hostfield = document.querySelector('#hostname')

    socket.on('receive_hostname', data => {
        console.log(data)
        hostfield.textContent = data.message
    })
})()