/* eslint-disable no-undef */
const express = require("express");
const app = express();
const mysql = require("mysql");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);
// MySQL Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "chat_history",
});

connection.connect((err) => {
  if (err) {
    console.log("Error connecting to MySQL database = ", err);
    return;
  }
  console.log('MySQL successfully connected')
});

app.get('/chat_history', (req, res) => {
  connection.query('SELECT * FROM chat_history', (error, results) => {
    if (error) throw error;
    const chatHistoryByRoom = {};
    results.forEach(row => {
      const { room_id, message_id, sender_id, message, timestamp } = row;
      if (!chatHistoryByRoom[room_id]) {
        chatHistoryByRoom[room_id] = [];
      }
      chatHistoryByRoom[room_id].push({
        message_id,
        sender_id,
        message,
        timestamp
      });
    });
    res.json(chatHistoryByRoom);
  });
});


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", (data) => {
    socket.leave(data);
    console.log(`User with ID: ${socket.id} leave room: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
