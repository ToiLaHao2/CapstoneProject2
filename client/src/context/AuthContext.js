import React, { createContext, useState, useContext, useEffect } from "react";
import publicAxios from "../api/publicAxios";
import privateAxios from "../api/privateAxios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const saveToken = (token) => {
        sessionStorage.setItem("token", token);
    };

    const removeToken = () => {
        sessionStorage.removeItem("token");
    };

    const register = async (fullName, email, password, getUserData) => {
        try {
            const response = await publicAxios.post("/auth/register", {
                user_full_name: fullName,
                user_email: email,
                user_password: password,
                user_avatar_url: "empty",
                checkMessage: "Register new account",
            });

            const data = response.data;

            // Cập nhật token và trạng thái xác thực
            setToken(data.data.token);
            setIsAuthenticated(true);
            saveToken(data.data.token);

            // Gọi API để lấy dữ liệu người dùng từ UserContext
            const result = await getUserData();
            return result;
        } catch (error) {
            console.log(error);
            return error.response.data.message;
        }
    };

    const login = async (userEmail, userPassword, getUserData) => {
        try {
            const response = await publicAxios.post("/auth/login", {
                user_email: userEmail,
                user_password: userPassword,
                checkMessage: "Login to account",
            });

            const data = response.data;

            // Cập nhật token và trạng thái xác thực
            setToken(data.data.token);
            setIsAuthenticated(true);
            saveToken(data.data.token);

            // Gọi API để lấy dữ liệu người dùng từ UserContext
            const result = await getUserData();
            return result;
        } catch (error) {
            console.log(error);
            return error.response.data.message;
        }
    };

    const logout = () => {
        setToken(null);
        setIsAuthenticated(false);
        removeToken();
    };

    const changePassword = async (
        user_email,
        current_password,
        new_password
    ) => {
        try {
            const response = await privateAxios.post("/auth/changePassword", {
                user_email: user_email,
                user_password: new_password, // Sửa lỗi đánh máy "usaer_password"
                user_last_password: current_password,
                checkMessage: "Change password",
            });

            const result = response.data.success;
            return result;
        } catch (error) {
            return error.response.data.message;
        }
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setLoading(false); // Ngừng tải
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                token,
                loading,
                login,
                logout,
                register,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
