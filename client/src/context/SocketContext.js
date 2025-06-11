// src/context/SocketProvider.jsx
import { createContext, useContext } from "react";
import useSocket from "../socket/useSocket";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socket = useSocket();

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}
