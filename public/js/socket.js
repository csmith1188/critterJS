const token = localStorage.getItem('authToken');

// Connect to the Socket.IO server
const socket = io('http://localhost:3000', { // Replace with your server URL
    query: {
        token: token
    }
});

// Event listener for successful connection
socket.on('connect', () => {
    console.log('Connected to the server');
});

// Listen for a message from the server
socket.on('gameState', (data) => {
    game.update(JSON.parse(data));
});