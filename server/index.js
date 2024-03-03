/* eslint-disable no-undef */
const express = require("express");
const app = express();
const mysql = require("mysql");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// MySQL Connection
const connection = mysql.createConnection({
  host: "34.143.237.75",
  user: "root",
  password: "Lukw@789",
  database: "chatbot-storage",
});

connection.connect((err) => {
  if (err) {
    console.log("Error connecting to MySQL database = ", err);
    return;
  }
  console.log("MySQL successfully connected");
});

app.get("/api/allroom", (req, res) => {
  connection.query("SELECT * FROM room", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get("/api/chat/:room_id", (req, res) => {
  const { room_id } = req.params;

  connection.query(
    "SELECT * FROM message WHERE room_id = ?",
    [room_id],
    (error, results) => {
      if (error) throw error;
      res.json(results);
    }
  );
});

app.post("/api/send", (req, res) => {
  const { sender_id, room_id, message_content } = req.body;
  const sql =
    "INSERT INTO message (sender_id, room_id, message_content, sent_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
  connection.query(
    sql,
    [sender_id, room_id, message_content],
    (error) => {
      if (error) {
        console.error("Error inserting message:", error);
        return res.status(500).json({ error: "Error inserting message" });
      }
      res.status(201).json({ message: "Message sent successfully" });
    }
  );
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
