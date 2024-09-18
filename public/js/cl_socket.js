const token = localStorage.getItem('authToken');

// Connect to the Socket.IO server
const socket = io('http://localhost:3000', { // Replace with your server URL
    query: {
        token: token
    }
});

// Event listener for successful connection
socket.on('connect', () => {
    if (gamecode) {
        socket.emit('joinGame', gamecode);
        console.log('Connected to ' + gamecode);
    } else {
        socket.emit('joinGame', username);
    }
});

// Listen for a message from the server
socket.on('gameState', (data) => {
    if (game) {
        game.update(JSON.parse(data));
    } else {
        game = new Game(JSON.parse(data).hostUser);
        game.update(JSON.parse(data));
    }
});