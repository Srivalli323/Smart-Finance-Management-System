import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useBudgetStore } from "@/stores/budget-store";
import {
  useGetBudgetStatusQuery,
  useGetUserHouseholdQuery,
} from "@/features/budget/budgetAPI";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { household, setBudgetStatus, setIsOverBudget } = useBudgetStore();

  const { data: householdData } = useGetUserHouseholdQuery();
  const householdId = householdData?._id || household?._id;

  useEffect(() => {
    if (!householdId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Join household room
      socket.emit("join-household", householdId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for budget warnings
    socket.on("budget-warning", (data: any) => {
      console.log("Budget warning received:", data);
      
      if (data.overBudget) {
        setIsOverBudget(true);
        toast.error("Budget Exceeded!", {
          description: `You've exceeded your monthly budget of ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data.budgetLimit)}. Current spending: ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data.totalSpentThisMonth)}`,
          duration: 10000,
        });

        // Update budget status in store
        setBudgetStatus({
          totalSpentThisMonth: data.totalSpentThisMonth,
          budgetLimit: data.budgetLimit,
          remaining: data.remaining,
          overBudget: data.overBudget,
          percentageUsed: data.percentageUsed,
        });
      }
    });

    return () => {
      if (socket && householdId) {
        socket.emit("leave-household", householdId);
      }
      socket.disconnect();
    };
  }, [householdId, setBudgetStatus, setIsOverBudget]);

  return socketRef.current;
};

