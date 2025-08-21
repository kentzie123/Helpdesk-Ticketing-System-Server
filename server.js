require("dotenv").config();


const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIO = require("socket.io");
const connectDB = require("./config/db");


const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const pagePrivilegeRoutes = require("./routes/pagePrivilegeRoutes");
const knowledgeBaseRoutes = require("./routes/knowledgeBaseRoutes");
const articleViewsRoutes = require("./routes/articleViewsRoutes");
const articleRatingsRoutes = require("./routes/articleRatingRoute");
const confirmationCodeRoutes = require("./routes/confirmationCodeRoutes");
const ticketRatingsRoutes = require("./routes/ticketRatingRoutes");
const ticketCommentsRoutes = require("./routes/ticketCommentRoutes");
const dashboardDataRoutes = require("./routes/dashboardDataRoute");

// Route usage
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", ticketRoutes);
app.use("/api", notificationRoutes);
app.use("/api", pagePrivilegeRoutes);
app.use("/api", knowledgeBaseRoutes);
app.use("/api", articleViewsRoutes);
app.use("/api", articleRatingsRoutes);
app.use("/api", confirmationCodeRoutes);
app.use("/api", ticketRatingsRoutes);
app.use("/api", ticketCommentsRoutes);
app.use("/api/dashboard", dashboardDataRoutes);

app.get("/api/test", (req, res) => {
  res.json({ status: "OK" });
});

// Models for watching changes
const Ticket = require("./models/tickets");
const TicketComment = require("./models/ticketComment");
const TicketRating = require("./models/ticketRating");
const Notification = require("./models/notification");
const Article = require("./models/knowledgeBase");
const User = require("./models/user");

const userSocketMap = {}; // {userId: socketId}

// Generic reusable change stream initializer
function initializeChangeStream(model, eventPrefix) {
  let changeStream;

  const watchStream = () => {
    if (changeStream) {
      try {
        changeStream.close();
      } catch (err) {
        console.error(`Error closing old ${eventPrefix} stream:`, err);
      }
    }

    changeStream = model.watch();

    changeStream.on("change", (change) => {
      console.log(`🟡 ${eventPrefix} Change detected:`, change.operationType);

      if (change.operationType === "insert") {
        io.emit(`${eventPrefix}Created`, change.fullDocument);
        console.log(`🟢 Emitted ${eventPrefix}Created`);
      }

      if (change.operationType === "update") {
        model
          .findById(change.documentKey._id)
          .then((updatedDoc) => {
            if (updatedDoc) {
              io.emit(`${eventPrefix}Updated`, updatedDoc);
              console.log(`🔵 Emitted ${eventPrefix}Updated`);
            }
          })
          .catch((err) =>
            console.error(
              `Error fetching updated ${eventPrefix.toLowerCase()}:`,
              err
            )
          );
      }

      if (change.operationType === "delete") {
        io.emit(`${eventPrefix}Deleted`, change.documentKey._id);
        console.log(`🔴 Emitted ${eventPrefix}Deleted`);
      }
    });

    changeStream.on("error", (err) => {
      console.error(`${eventPrefix} Change Stream error:`, err);
      setTimeout(watchStream, 5000); // restart after 5s
    });

    changeStream.on("close", () => {
      console.warn(`${eventPrefix} Change Stream closed`);
      setTimeout(watchStream, 5000); // restart after 5s
    });
  };

  watchStream();
}

// Special Notification stream (because it emits only to target user)
function initializeNotificationStream() {
  let changeStream;

  const watchStream = () => {
    if (changeStream) {
      try {
        changeStream.close();
      } catch (err) {
        console.error("Error closing old Notification stream:", err);
      }
    }

    changeStream = Notification.watch();

    changeStream.on("change", (change) => {
      console.log("🟡 Notification Change detected:", change.operationType);

      if (change.operationType === "insert") {
        const receiverSocketId =
          userSocketMap[change.fullDocument.receiverUserId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "notificationCreated",
            change.fullDocument
          );
          console.log("🟢 Emitted notificationCreated");
        }
      }

      if (change.operationType === "update") {
        Notification.findById(change.documentKey._id).then(
          (updatedNotification) => {
            if (updatedNotification) {
              const receiverSocketId =
                userSocketMap[updatedNotification.receiverUserId];
              if (receiverSocketId) {
                io.to(receiverSocketId).emit(
                  "notificationUpdated",
                  updatedNotification
                );
                console.log("🔵 Emitted notificationUpdated");
              }
            }
          }
        );
      }

      if (change.operationType === "delete") {
        io.emit("notificationDeleted", change.documentKey._id);
        console.log("🔴 Emitted notificationDeleted");
      }
    });

    changeStream.on("error", (err) => {
      console.error("Notification Change Stream error:", err);
      setTimeout(watchStream, 5000); // restart after 5s
    });

    changeStream.on("close", () => {
      console.warn("Notification Change Stream closed");
      setTimeout(watchStream, 5000); // restart after 5s
    });
  };

  watchStream();
}

// Connect to DB and set up change streams
connectDB().then(() => {
  initializeChangeStream(User, "user");
  initializeChangeStream(Ticket, "ticket");
  initializeChangeStream(TicketComment, "ticketComment");
  initializeChangeStream(TicketRating, "ticketRating");
  initializeChangeStream(Article, "article");
  initializeNotificationStream();
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  console.log("Online users:", userSocketMap);

  // Let everyone know who's online
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
