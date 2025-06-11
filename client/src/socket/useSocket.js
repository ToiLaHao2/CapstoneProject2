// src/socket/useSocket.js
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "./index";

export default function useSocket() {
    const [socket, setSocket] = useState(() => getSocket());

    useEffect(() => {
        // Lúc mount: nếu chưa có socket → tạo mới
        if (!socket) {
            const token = sessionStorage.getItem("token");
            const s = connectSocket(token);
            setSocket(s);
        }
        // Clean up khi unmount toàn app (hiếm)
        return () => socket?.off();
    }, [socket]);

    return socket;
}
