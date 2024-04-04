/* eslint-disable no-undef */
const express = require("express");
const app = express();
const mysql = require("mysql");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const moment = require('moment-timezone');
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// MySQL Connection
const connection = mysql.createConnection({
  host: "34.143.250.167",
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
  const { limit } = req.query;

  let sql = "SELECT * FROM message WHERE room_id = ?";
  const values = [room_id];

  if (limit) {
    sql += " ORDER BY message_id DESC LIMIT ?";
    values.push(parseInt(limit));
  } else {
    sql += " ORDER BY message_id DESC";
    values.push(parseInt(limit));
  }

  connection.query(sql, values, (error, results) => {
    if (error) throw error;
    res.json(results.reverse());
  });
});

app.post("/api/send", (req, res) => {
  const { name, sender_id, room_id, message_content } = req.body;
  const sql =
    "INSERT INTO message (name,sender_id, room_id, message_content, sent_at) VALUES (?,?, ?, ?, CURRENT_TIMESTAMP)";
  connection.query(
    sql,
    [name, sender_id, room_id, message_content],
    (error) => {
      const utcDate = new Date().toISOString();

      // Convert UTC time to Asia/Bangkok timezone
      const sent_at = moment().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      if (error) {
        console.error("Error inserting message:", error);
        return res.status(500).json({ error: "Error inserting message" });
      }
      res.status(201).json({
        name,
        sender_id,
        room_id,
        message_content,
        sent_at,
        message: "Message sent successfully",
      });
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

server.listen(8080, () => {
  console.log("SERVER RUNNING");
});
