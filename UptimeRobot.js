const http = require('http');
const axios = require('axios');
const express = require('express');
const socketIo = require('socket.io');

// Constants
const WEBSITE_URL_1 = 'http://ridwanz-botz.ridwanzsptra.repl.co/';
const WEBSITE_URL_2 = 'https://ridz-botz.glontorkebumen.repl.co/';
const CHECK_INTERVAL_MS = 5000;
const SERVER_PORT = process.env.PORT || 3000;
const SERVER_HOST = '0.0.0.0';

// Express App
const app = express();

// HTTP server for Express
const server = http.createServer(app);

// Socket.IO connection and event handling
const io = socketIo(server);
io.on('connection', (socket) => {
  console.log('New client connected');
  checkWebsites(socket);
});

// Check websites function
async function checkWebsite(url, socket) {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      console.log(`${url} is up and running!`);
      socket.emit('status', { url: url, status: 'up' });
    } else {
      console.error(`${url} returned a non-OK status code: ${response.status}`);
      socket.emit('status', { url: url, status: 'down' });
    }
  } catch (error) {
    console.error(`Error accessing ${url}: ${error.message}`);
    socket.emit('status', { url: url, status: 'down' });
  }
}

// Check all websites function
async function checkWebsites(socket) {
  try {
    await Promise.all([
      checkWebsite(WEBSITE_URL_1, socket),
      checkWebsite(WEBSITE_URL_2, socket),
    ]);
    console.log('All websites are checked!');
    socket.emit('status', { message: 'All websites checked' });
  } catch (error) {
    console.error(`Error checking websites: ${error.message}`);
    socket.emit('status', { message: 'Error checking websites' });
  }
}

// Set up Express routes
app.get('/', (req, res) => {
  res.send('App is running');
});

// Start the server
server.listen(SERVER_PORT, SERVER_HOST, (err) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    return;
  }
  console.log(`Server is listening on port ${SERVER_PORT}`);
});

// Handling uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`Unhandled exception: ${error.message}`);
});
