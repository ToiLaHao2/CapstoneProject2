import React, { createContext, useState, useContext } from "react";
import privateAxios from "../api/privateAxios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Lấy thông tin người dùng từ API
    const getUserData = async () => {
        try {
            const response = await privateAxios.post("/user/getProfile", {
                checkMessage: "Get user profile"
            });

            if (response.status !== 200) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.data;
            console.log(data.data);
            setUser(data.data); // Cập nhật trạng thái người dùng
        } catch (error) {
            console.error("Fetch user error:", error);
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
