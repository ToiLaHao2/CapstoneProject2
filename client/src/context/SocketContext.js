// socket/SocketProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

/* ••• 1. Context khởi tạo ••• */
const SocketContext = createContext({
    socket: null,        // instance Socket.IO hoặc null
    connected: false,    // true khi .connect() thành công
});

/* ••• 2. Provider ••• */
export const SocketProvider = ({ token, children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return () => { };               // chưa đăng nhập → không connect

        /* khởi tạo */
        // const SOCKET_URL = "http://tasktaskminderstudio.3utilities.com:5000"
        // SOCKET_URL = "http://localhost:5000"
        const SOCKET_URL = "https://capstoneproject2-9mv8.onrender.com"

        const skt = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
        });

        /* listener trạng thái */
        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

        skt.on("connect", handleConnect);
        skt.on("disconnect", handleDisconnect);

        /* lưu instance vào state để component con lấy được */
        setSocket(skt);

        /* dọn dẹp khi token đổi / unmount */
        return () => {
            skt.off("connect", handleConnect);
            skt.off("disconnect", handleDisconnect);
            skt.disconnect();
            setSocket(null);
            setConnected(false);
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

/* ••• 3. Hook dùng trong component ••• */
export const useSocket = () => useContext(SocketContext);
