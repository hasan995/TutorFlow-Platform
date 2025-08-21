import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setConnectionStatus("connecting");

      // Create WebSocket connection
      const newSocket = io("ws://localhost:8000", {
        path: "/ws/notifications/",
        auth: { token },
        transports: ["websocket"],
        autoConnect: true,
      });

      newSocket.on("connect", () => {
        console.log("🔔 Connected to notification WebSocket");
        setIsConnected(true);
        setConnectionStatus("connected");
      });

      newSocket.on("disconnect", () => {
        console.log("🔔 Disconnected from notification WebSocket");
        setIsConnected(false);
        setConnectionStatus("disconnected");
      });

      newSocket.on("connect_error", (error) => {
        console.error("🔔 WebSocket connection error:", error);
        setConnectionStatus("error");
        setIsConnected(false);
      });

      // Listen for incoming notifications
      newSocket.on("notification", (data: Notification) => {
        console.log("🔔 Received notification:", data);
        setNotifications((prev) => [data, ...prev]);

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(data.title, {
            body: data.message,
            icon: "/favicon.ico",
            tag: `notification-${data.id}`,
          });
        }
      });

      setSocket(newSocket);

      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }

      return () => {
        newSocket.close();
      };
    }
  }, []);

  // Fetch existing notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(
          "http://localhost:8000/api/notifications/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.results || data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(
        `http://localhost:8000/api/notifications/${id}/mark_read/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(
        "http://localhost:8000/api/notifications/mark_all_read/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        isConnected,
        connectionStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};
