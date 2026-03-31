// // importing required modules
// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./dbConfig/config');
// const app = express();
// // Load environment variables from .env file
// dotenv.config();
// // Set the port from environment variable or default to 3000
// const PORT = process.env.PORT || 3000;
// // Importing routes
// const authRoutes = require('./routes/authRoutes');
// const messageRoutes = require('./routes/messageRoute');
// const ConversationRoute = require('./routes/conversationRoutes');
// // Middleware to parse JSON bodies
// app.use(express.json());

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/messages', messageRoutes);
// app.use('/api/v1/conversations', ConversationRoute);


// // Define a simple route for the root URL
// app.get('/', (req, res) => {
//   res.send('Hello My Friend!');
// }   );

// connectDB();
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.json());
app.set("io", io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const Message = require('./model/Message');
const Conversation = require('./model/Conversation');

const onlineUsers = new Map();

// ====== Socket.io ======
io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", async ({ conversationId, senderId, receiverId, content, type }) => {
    const message = new Message({ conversation: conversationId, sender: senderId, content, type });
    const savedMessage = await message.save();
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: savedMessage._id });
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit("newMessage", savedMessage);
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit("stopTyping", { senderId });
  });

  socket.on("seenMessage", async ({ messageId, userId }) => {
    const message = await Message.findById(messageId);
    if (message && !message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
      const receiverSocket = onlineUsers.get(message.sender.toString());
      if (receiverSocket) io.to(receiverSocket).emit("seenMessage", messageId);
    }
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
app.use('/api/v1/conversations', conversationRouter);

// Messages REST API (optional, realtime via socket)
const messageRouter = require('./routes/messageRoutes'); // لو عندك ملف Messages موجود
app.use('/api/v1/messages', messageRouter);

app.get('/', (req, res) => res.send('WhatsApp Backend running!'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));