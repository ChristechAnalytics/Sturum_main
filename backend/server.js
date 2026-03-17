require("dotenv").config();
const express = require("express");
const http = require("http"); // Import http module
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/posts");
const messageRoutes = require("./routes/messages");
const materialRoutes = require("./routes/materials");
const searchRoutes = require("./routes/search");
const Message = require("./models/Message"); // Import Message model

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});
// Middleware to pass socket.io instance to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI_COMPASS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start server after successful DB connection
    server.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
