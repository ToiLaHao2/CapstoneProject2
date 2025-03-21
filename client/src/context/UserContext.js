import React, { createContext, useState, useContext } from "react";
import privateAxios from "../api/privateAxios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Lấy thông tin người dùng từ API
    const getUserData = async () => {
        try {
            const response = await privateAxios.post("/user/getProfile", {
                checkMessage: "Get user profile",
            });

            const data = await response.data;
            setUser(data.data);
            return "Success"; // Cập nhật trạng thái người dùng
        } catch (error) {
            console.log(error.error.Error);
            return `Fetch user error: ${error.message}`;
        }
    };

    // upload avatar
    const uploadAvatar = async (formData) => {
        try {
            const response = await privateAxios.post(
                "/user/uploadAvatar",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const data = await response.data;
            setUser(data.data);
            return "Success";
        } catch (error) {
            console.log(error.error.Error);
            return `Upload avatar error: ${error.message}`;
        }
    };

    return (
        <UserContext.Provider value={{ user, getUserData, uploadAvatar }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
