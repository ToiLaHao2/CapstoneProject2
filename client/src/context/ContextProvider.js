import React from "react";
import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { BoardProvider } from "./BoardContext";

const ContextProvider = ({ children }) => {
    return (
        <AuthProvider>
            <UserProvider>
                <BoardProvider>
                    {children}
                </BoardProvider>
            </UserProvider>
        </AuthProvider>
    );
};

export default ContextProvider;
