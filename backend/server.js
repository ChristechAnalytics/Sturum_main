require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/posts");
const messageRoutes = require("./routes/messages");
const materialRoutes = require("./routes/materials");
const searchRoutes = require("./routes/search");
const fileRoutes = require("./routes/files");
const refreshTokenRoutes = require("./routes/refreshToken");
const departmentRoutes = require("./routes/departments");
const { socketAuth } = require("./middleware/socketAuth");
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, "");
};

const frontendUrl = normalizeUrl(process.env.FRONTEND_URL) || "http://localhost:3000";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"],
  },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://localhost:3000",
]
  .filter(Boolean)
  .map(normalizeUrl);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeUrl(origin);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(normalizedOrigin)
      ) {
        callback(null, normalizedOrigin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
  });
}

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Sturum API is running",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiLimiter);
app.use("/api/users/signup", authLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/auth/refresh", authLimiter);

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/auth/refresh", refreshTokenRoutes);
app.use("/api/departments", departmentRoutes);

io.use(socketAuth);

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);
  if (socket.department) {
    socket.join(`department:${socket.department}`);
  }
  console.log(`Socket connected: user ${socket.userId} (${socket.department})`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: user ${socket.userId}`);
  });
});

mongoose
  .connect(process.env.MONGO_URI_ATLAS)
  .then(() => {
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
