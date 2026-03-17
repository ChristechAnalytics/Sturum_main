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

// Normalize URL helper - removes trailing slashes for consistent comparison
const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const frontendUrl = normalizeUrl(process.env.FRONTEND_URL) || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://localhost:3000"
]
  .filter(Boolean) // Remove undefined values
  .map(normalizeUrl); // Normalize all URLs

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize the incoming origin (remove trailing slash)
    const normalizedOrigin = normalizeUrl(origin);
    
    // Allow if origin is in allowed list or if no FRONTEND_URL is set (development)
    if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      // Return the normalized origin (without trailing slash) to match browser's origin
      callback(null, normalizedOrigin);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Normalized origin:', normalizedOrigin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});
// Middleware to pass socket.io instance to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Root route - health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Sturum API is running", 
    status: "ok",
    timestamp: new Date().toISOString()
  });
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
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
