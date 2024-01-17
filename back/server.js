
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors=require('cors')
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1/usermanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    name: String,
    phone:String,
    address:String,
    role:String,
    userid:String,
    email: String,
  });

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(cors())
// RESTful API for CRUD operations
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    io.emit('userChange', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    io.emit('userChange', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    io.emit('userChange', { action: 'delete', user: deletedUser });
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



