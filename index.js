// const express = require('express');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const path = require('path');

// dotenv.config();
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });
// app.use(cors({
//   origin: "http://localhost:5174", // اسم الفرونت
//   methods: ["GET","POST","PUT","DELETE"],
// }));
// app.use(express.json());
// app.set("io", io);

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

// const Message = require('./model/Message');
// const Conversation = require('./model/Conversation');

// const onlineUsers = new Map();

// // ====== Socket.io ======
// io.on("connection", (socket) => {
//   socket.on("addUser", (userId) => {
//     onlineUsers.set(userId, socket.id);
//     io.emit("onlineUsers", Array.from(onlineUsers.keys()));
//   });

//   socket.on("sendMessage", async ({ conversationId, senderId, receiverId, content, type }) => {
//     const message = new Message({ conversation: conversationId, sender: senderId, content, type });
//     const savedMessage = await message.save();
//     await Conversation.findByIdAndUpdate(conversationId, { lastMessage: savedMessage._id });
//     const receiverSocket = onlineUsers.get(receiverId);
//     if (receiverSocket) io.to(receiverSocket).emit("newMessage", savedMessage);
//   });

//   socket.on("typing", ({ senderId, receiverId }) => {
//     const receiverSocket = onlineUsers.get(receiverId);
//     if (receiverSocket) io.to(receiverSocket).emit("typing", { senderId });
//   });

//   socket.on("stopTyping", ({ senderId, receiverId }) => {
//     const receiverSocket = onlineUsers.get(receiverId);
//     if (receiverSocket) io.to(receiverSocket).emit("stopTyping", { senderId });
//   });

//   socket.on("seenMessage", async ({ messageId, userId }) => {
//     const message = await Message.findById(messageId);
//     if (message && !message.readBy.includes(userId)) {
//       message.readBy.push(userId);
//       await message.save();
//       const receiverSocket = onlineUsers.get(message.sender.toString());
//       if (receiverSocket) io.to(receiverSocket).emit("seenMessage", messageId);
//     }
//   });

//   socket.on("disconnect", () => {
//     for (let [userId, socketId] of onlineUsers) {
//       if (socketId === socket.id) onlineUsers.delete(userId);
//     }
//     io.emit("onlineUsers", Array.from(onlineUsers.keys()));
//   });
// });

// // ====== Routes ======
// const conversationRouter = require('./routes/conversationRoutes');
// app.use('/api/v1/conversations', conversationRouter);

// const authRouter = require('./routes/authRoutes');
// app.use('/api/v1/auth', authRouter);

// // Messages REST API (optional, realtime via socket)
// const messageRouter = require('./routes/messageRoutes'); 
// app.use('/api/v1/messages', messageRouter);

// app.get('/', (req, res) => res.send('WhatsApp Backend running!'));

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Socket.io CORS
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});
app.set("io", io);

// Express CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ====== Socket.io logic ======
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", async ({ conversationId, senderId, receiverId, content, type }) => {
    // Your logic here...
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers) {
      if (socketId === socket.id) onlineUsers.delete(userId);
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ====== Routes ======
const conversationRouter = require('./routes/conversationRoutes');
const authRouter = require('./routes/authRoutes');
const messageRouter = require('./routes/messageRoutes');

app.use('/api/v1/conversations', conversationRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/messages', messageRouter);

app.get('/', (req, res) => res.send('WhatsApp Backend running!'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));