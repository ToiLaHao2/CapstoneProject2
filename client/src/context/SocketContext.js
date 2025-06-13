// socket/SocketProvider.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext({ socket: null, connected: false });

export const SocketProvider = ({ token, children }) => {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return () => { };        // chưa đăng nhập → không kết nối

        socketRef.current = io("http://localhost:5000", {
            auth: { token },
            transports: ["websocket"],
        });

        socketRef.current.on("connect", () => setConnected(true));
        socketRef.current.on("disconnect", () => setConnected(false));

        return () => socketRef.current.disconnect();  // dọn dẹp
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
