// importing required modules
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./dbConfig/config');
const app = express();
// Load environment variables from .env file
dotenv.config();
// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;
// Importing routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoute');
const ConversationRoute = require('./routes/conversationRoutes');
// Middleware to parse JSON bodies
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/conversations', ConversationRoute);


// Define a simple route for the root URL
app.get('/', (req, res) => {
  res.send('Hello My Friend!');
}   );

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});