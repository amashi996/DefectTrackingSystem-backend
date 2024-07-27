const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const cors = require("cors");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const reviews = require("./routes/api/reviews");
const auth = require("./routes/api/auth");
const projects = require("./routes/api/projects");
const defects = require("./routes/api/defects");
const defectComments = require("./routes/api/defectComments");
const leaderboard = require("./routes/api/leaderboard");
const badges = require("./routes/api/badges");
const achievements = require("./routes/api/achievements");

const app = express();

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Use CORS middleware
app.use(cors());

// Use Routes
//app.use("/api/users", users);
//app.use("/api/auth", auth);

app.use("/api/users", users);
app.use("/api/auth", auth);

app.use("/api/profile", profile);
app.use("/api/reviews", reviews);
app.use("/api/leaderboard", leaderboard);
app.use("/api/projects", projects);
app.use("/api/defects", defects);
app.use("/api/defComments", defectComments);
app.use("/api/badges", badges);
app.use("/api/achievements", achievements);

const port = process.env.PORT || 5002;

// new
const server = http.createServer(app);
const io = socketIo(server);

// Setup Socket.io
io.on("connection", (socket) => {
  console.log("New client connected");

  // Listen for leaderboard update requests
  socket.on("getLeaderboard", async () => {
    try {
      const leaderboard = await User.find()
        .sort({ totalPoints: -1 })
        .select("name totalPoints");
      socket.emit("leaderboard", leaderboard);
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
