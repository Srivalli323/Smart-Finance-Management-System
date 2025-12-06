import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Env } from "./env.config";

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: Env.FRONTEND_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room for a specific household
    socket.on("join-household", (householdId: string) => {
      socket.join(`household:${householdId}`);
      console.log(`Socket ${socket.id} joined household: ${householdId}`);
    });

    // Leave household room
    socket.on("leave-household", (householdId: string) => {
      socket.leave(`household:${householdId}`);
      console.log(`Socket ${socket.id} left household: ${householdId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
};

// Helper function to emit budget warning to a household
export const emitBudgetWarning = (householdId: string, budgetStatus: any) => {
  if (io) {
    io.to(`household:${householdId}`).emit("budget-warning", {
      householdId,
      ...budgetStatus,
      timestamp: new Date().toISOString(),
    });
  }
};

