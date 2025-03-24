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

    // search user by full name
    const searchUsers = async (userId, searchString) => {
        try {
            const response = await privateAxios.post("/user/searchUsers", {
                user_id: userId,
                search_string: searchString,
                checkMessage: "Search users",
            });

            const data = await response.data;
            if (data.success) {
                return data.data.users;
            } else {
                console.error("Search users failed:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    };

    // Lấy các cards sắp hết hạn của user
    const getUserCardsIncoming = async (userId) => {
        try {
            const response = await privateAxios.post(
                "/user/getUserCardsIncoming",
                {
                    user_id: userId,
                    checkMessage: "Get user cards incoming",
                }
            );

            const data = await response.data;
            if (data.success) {
                return data.data.userCards;
            } else {
                console.error("Get user cards incoming failed:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error getting user cards incoming:", error);
            return [];
        }
    };

    // upload avatar
    const uploadAvatar = async (formData) => {
        try {
            const response = await privateAxios.post(
                "/upload/uploadAvatar",
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
        <UserContext.Provider
            value={{
                user,
                getUserData,
                searchUsers,
                getUserCardsIncoming,
                uploadAvatar,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
