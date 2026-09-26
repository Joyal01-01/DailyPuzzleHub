import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const port = parseInt(process.env.PORT || "3005", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: true, hostname: "localhost", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 1v1 Matchmaking Queue
  interface QueuedPlayer {
    socketId: string;
    userName: string;
    userAvatar: string;
  }
  const matchmakingQueue: QueuedPlayer[] = [];

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Player connected: ${socket.id}`);

    socket.on("join-matchmaking", (data) => {
      matchmakingQueue.push({
        socketId: socket.id,
        userName: data.userName || "Player",
        userAvatar: data.userAvatar || "",
      });

      if (matchmakingQueue.length >= 2) {
        const p1 = matchmakingQueue.shift()!;
        const p2 = matchmakingQueue.shift()!;
        const matchId = `match_${Date.now()}`;

        io.to(p1.socketId).emit("match-found", {
          matchId,
          opponent: { name: p2.userName, avatar: p2.userAvatar },
        });

        io.to(p2.socketId).emit("match-found", {
          matchId,
          opponent: { name: p1.userName, avatar: p1.userAvatar },
        });

        socket.join(matchId);
      }
    });

    socket.on("progress-update", (data) => {
      socket.broadcast.emit("opponent-progress", {
        matchId: data.matchId,
        progress: data.progress,
      });
    });

    socket.on("player-won", (data) => {
      io.emit("match-ended", {
        matchId: data.matchId,
        winnerId: socket.id,
        winnerName: data.winnerName,
      });
    });

    socket.on("disconnect", () => {
      const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
      if (idx !== -1) matchmakingQueue.splice(idx, 1);
      console.log(`[Socket.io] Player disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> DailyPuzzleHub Enterprise Platform running on http://localhost:${port}`);
    console.log(`> Mode: Development`);
    console.log(`> AdSense H5 Publisher: ca-pub-5643499410858608`);
  });
});
