const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const critters = require('./sv_game.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const AUTH_URL = 'http://172.16.3.100:420/oauth';
const THIS_URL = 'http://localhost:3000/login';

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up the session middleware
const sessionMiddleware = session({
    secret: 'mysecretkey', // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
});

// Use the session middleware in Express
app.use(sessionMiddleware);

// Share the session with Socket.IO
io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/login`)
};

// Define a route for the home page
app.get('/', (req, res) => {
    res.render('index', { username: req.session.user || 'World', games: games });
});

// Login Page
app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

// Game page
app.get('/game/:gamecode', isAuthenticated, (req, res) => {
    let gamecode = req.params.gamecode;
    try {
        res.render('game.ejs', { username: req.session.user, gamecode: gamecode })
    }
    catch (error) {
        res.send(error.message)
    }
});

// Game page
app.get('/offline', (req, res) => {
    try {
        res.render('offline.ejs', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Access the session within the socket
    const session = socket.handshake.session;

    if (!session) {
        console.log('No token found in session');
        socket.disconnect(true);
    }

    // Listen for a 'joinRoom' event from the client
    socket.on('joinGame', (roomId) => {
        if (session.token) {   
            socket.join(roomId);  // Join the room with the given roomId
            // If no game exists with the given roomId, create a new game
            if (!games.some(game => game.hostUser.username === roomId)) {
                games.push(new critters.Game(session.token));
            }
            console.log(`Socket ${socket.id} (${session.token.username}) joined room ${roomId}`);
            let game = games.find(game => game.hostUser.username === roomId);
            game.critters.push(new critters.Critter(session.token));
            io.to(game.hostUser.username).emit('gameState', JSON.stringify(game));
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Find the game that the user was hosting
        let game = games.find(game => game.hostUser.username === session.token.username);
        if (game) {
            // Remove the game from the list
            games.splice(games.indexOf(game), 1);
        } else {
            // Find game user was playing in
            game = games.find(game => game.critters.some(critter => critter.owner.username === session.token.username));
            if (game) {
                // Remove the critter from the game
                game.critters = game.critters.filter(critter => critter.owner.username !== session.token.username);
            }
        }
    });

    // Example of handling a custom event
    socket.on('chat', (msg) => {
        io.to(socket).emit('chat', msg);
    });

    socket.on('userCommand', (data) => {
        let game = games.find(game => game.hostUser === session.token);
        let critter = game.critters.find(critter => critter.owner.username === session.token.username);
        critter.command = data.command;
    });

    socket.on('resetCritter', (data) => {
        let game = games.find(game => game.hostUser.username === data.hostUser.username);
        let critter = game.critters.find(critter => critter.owner.username === session.token.username);
        critter.resetCritter();
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Run games
var games = [];
// for each game in the games array, run the step function
setInterval(() => {
    games.forEach(game => {
        game.step();
        io.to(game.hostUser.username).emit('gameState', JSON.stringify(game));
    });
}, 500);