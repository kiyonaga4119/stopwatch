const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('create room', (nickname) => {
    const roomId = uuidv4();
    rooms[roomId] = {
      startTime: null,
      elapsed: 0,
      laps: [],
      members: {}
    };
    rooms[roomId].members[socket.id] = nickname;
    socket.join(roomId);
    socket.emit('room created', roomId);
  });

  socket.on('join room', (roomId, nickname) => {
    if (rooms[roomId]) {
      rooms[roomId].members[socket.id] = nickname;
      socket.join(roomId);
      socket.emit('room joined', roomId, rooms[roomId].elapsed, rooms[roomId].laps, rooms[roomId].startTime);
    } else {
      socket.emit('error', 'Room does not exist');
    }
  });

  socket.on('start stopwatch', (roomId) => {
    if (rooms[roomId] && !rooms[roomId].startTime) {
      rooms[roomId].startTime = Date.now() - rooms[roomId].elapsed;
      io.to(roomId).emit('start stopwatch', rooms[roomId].startTime, rooms[roomId].members[socket.id]);
    }
  });

  socket.on('stop stopwatch', (roomId) => {
    if (rooms[roomId] && rooms[roomId].startTime) {
      rooms[roomId].elapsed = Date.now() - rooms[roomId].startTime;
      rooms[roomId].startTime = null;
      io.to(roomId).emit('stop stopwatch', rooms[roomId].elapsed, rooms[roomId].members[socket.id]);
    }
  });

  socket.on('reset stopwatch', (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].startTime = null;
      rooms[roomId].elapsed = 0;
      rooms[roomId].laps = [];
      io.to(roomId).emit('reset stopwatch', rooms[roomId].members[socket.id]);
    }
  });

  socket.on('lap stopwatch', (roomId) => {
    if (rooms[roomId]) {
      const lapTime = Date.now() - rooms[roomId].startTime;
      rooms[roomId].laps.push({ time: lapTime, nickname: rooms[roomId].members[socket.id] });
      io.to(roomId).emit('lap stopwatch', lapTime, rooms[roomId].members[socket.id]);
    }
  });

  socket.on('chat message',     (roomId, message) => {
    io.to(roomId).emit('chat message', message);
});

socket.on('change nickname', (roomId, oldNickname, newNickname) => {
    if (rooms[roomId]) {
        for (let id in rooms[roomId].members) {
            if (rooms[roomId].members[id] === oldNickname) {
                rooms[roomId].members[id] = newNickname;
                break;
            }
        }
        io.to(roomId).emit('nickname changed', oldNickname, newNickname);
    }
});

socket.on('leave room', (roomId) => {
    if (rooms[roomId] && rooms[roomId].members[socket.id]) {
        delete rooms[roomId].members[socket.id];
        socket.leave(roomId);
        // 部屋が空になったら削除する
        if (Object.keys(rooms[roomId].members).length === 0) {
            delete rooms[roomId];
        }
    }
});

socket.on('disconnect', () => {
    console.log('user disconnected');
    for (const roomId in rooms) {
        if (rooms[roomId].members[socket.id]) {
            delete rooms[roomId].members[socket.id];
            // 部屋が空になったら削除する
            if (Object.keys(rooms[roomId].members).length === 0) {
                delete rooms[roomId];
            }
            break;
        }
    }
});
});

server.listen(3000, () => {
console.log('listening on *:3000');
});




