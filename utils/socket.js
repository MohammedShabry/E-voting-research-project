
//socket.js
import { io } from 'socket.io-client';

// Create and export the socket instance
export const socket = io({
    path: "/api/userInteraction/socket", // Make sure this path matches your API route
    // You can also add other configurations here like `cors`, `reconnect`, etc.
});

console.log("Socket.IO client initialized.");

// Log socket connection
socket.on("connect", () => {
    console.log("Connected to server with socket ID:", socket.id);
});

// Log socket disconnection
socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});
