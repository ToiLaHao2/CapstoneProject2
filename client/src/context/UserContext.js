import React, { createContext, useState, useContext, useEffect } from "react";
import privateAxios from "../api/privateAxios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const colorHashMap = {
        A: "#8B0000", // Dark Red
        B: "#00008B", // Dark Blue
        C: "#006400", // Dark Green
        D: "#B8860B", // Dark Goldenrod
        E: "#FF8C00", // Dark Orange
        F: "#4B0082", // Indigo
        G: "#8B4513", // Saddle Brown
        H: "#2F4F4F", // Dark Slate Gray
        I: "#008B8B", // Dark Cyan
        J: "#8B0000", // Dark Red
        K: "#556B2F", // Dark Olive Green
        L: "#483D8B", // Dark Slate Blue
        M: "#8B008B", // Dark Magenta
        N: "#800000", // Maroon
        O: "#9932CC", // Dark Orchid
        P: "#191970", // Midnight Blue
        Q: "#8B0000", // Dark Red
        R: "#228B22", // Forest Green
        S: "#A52A2A", // Brown
        T: "#2E8B57", // Sea Green
        U: "#696969", // Dim Gray
        V: "#3CB371", // Medium Sea Green
        W: "#8B0000", // Dark Red
        X: "#4B0082", // Indigo
        Y: "#9400D3", // Dark Violet
        Z: "#5F9EA0", // Cadet Blue
    };

    // Trong UserContext
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Lấy thông tin người dùng từ API
    const getUserData = async () => {
        try {
            const response = await privateAxios.post("/user/getProfile", {
                checkMessage: "Get user profile",
            });

            const data = await response.data;
            setUser(data.data);
            sessionStorage.setItem("user", JSON.stringify(data.data)); // Lưu user
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


    const updateUserProfile = async (userUpdateDetails) => {
        try {
            // Server của bạn đang tự động thêm user_id từ token, nên chúng ta chỉ cần gửi user_update_details và checkMessage
            const payload = {
                user_update_details: userUpdateDetails,
                checkMessage: "Update user profile",
            };

            const response = await privateAxios.post("/user/updateProfile", payload);

            const data = await response.data;
            if (data.success) {
                // Cập nhật state user và sessionStorage sau khi update thành công
                setUser(data.data);
                sessionStorage.setItem("user", JSON.stringify(data.data));
                return { success: true, message: "User profile updated successfully" };
            } else {
                // Xử lý lỗi từ server (ví dụ: "No fields were updated")
                return { success: false, message: data.message || "Failed to update user profile" };
            }
        } catch (error) {
            // Xử lý lỗi mạng hoặc lỗi từ server không nằm trong data.success
            console.error("Error updating user profile:", error.response?.data?.Error || error.message);
            return { success: false, message: `Error updating user profile: ${error.response?.data?.Error || error.message}` };
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
                updateUserProfile,
                colorHashMap,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
