const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const critters = require('./game.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const AUTH_URL = 'http://formbar.animetidd.is/oauth';
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
    res.render('index', { name: 'World' });
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
app.get('/game', isAuthenticated, (req, res) => {
    try {
        res.render('game.ejs', { user: req.session.user })
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

    if (session && session.token) {
        console.log('Creating a game');
        games.push(new critters.Game(socket.id, session.token));
    } else {
        console.log('No token found in session');
        socket.disconnect(true);
    }

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Remove the game from the list
        games = games.filter(game => game.socket !== socket.id);
    });

    // Example of handling a custom event
    socket.on('chat', (msg) => {
        io.to(socket).emit('chat', msg);
    });

    socket.on('userCommand', (data) => {
        let game = games.find(game => game.socketid === socket.id);
        let critter = game.critters.find(critter => critter.owner.username === session.user);
        critter.command = data.command;
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
        io.to(game.socketid).emit('gameState', JSON.stringify(game));
    });
}, 500);