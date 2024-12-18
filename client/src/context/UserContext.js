import React, { createContext, useState, useContext } from "react";
import privateAxios from "../api/privateAxios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Lấy thông tin người dùng từ API
    const getUserData = async () => {
        try {
            const response = await privateAxios.post(
                "/user/getProfile",
                JSON.stringify({
                    checkMessage: "Get user profile"
                })
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
            console.log(data);
            setUser(data); // Cập nhật trạng thái người dùng
        } catch (error) {
            console.error("Fetch user error:", error.message);
        }
    };

    // update user

    return (
        <UserContext.Provider value={{ user, getUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
