import React, { createContext, useState, useContext, useEffect } from "react";
import publicAxios from "../api/publicAxios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const saveToken = token => {
        localStorage.setItem("token", token);
    };

    const removeToken = () => {
        localStorage.removeItem("token");
    };

    const register = async (fullName, email, password, getUserData) => {
        try {
            const response = await publicAxios.post("/auth/register", {
                user_full_name: fullName,
                user_email: email,
                user_password: password,
                user_avatar_url: "empty",
                checkMessage: "Register new account"
            });

            if (response.status !== 200) {
                throw new Error("Registration failed!");
            }

            const data = response.data;

            // Cập nhật token và trạng thái xác thực
            setToken(data.data.token);
            setIsAuthenticated(true);
            saveToken(data.data.token);

            // Gọi API để lấy dữ liệu người dùng từ UserContext
            const result = await getUserData();
            return result;
        } catch (error) {
            return `Registration error: ${error}`;
        }
    };

    const login = async (userEmail, userPassword, getUserData) => {
        try {
            const response = await publicAxios.post(
                "/auth/login",
                JSON.stringify({
                    user_email: userEmail,
                    user_password: userPassword,
                    checkMessage: "Login to account"
                })
            );

            if (response.status !== 200) {
                throw new Error("Login failed!");
            }

            const data = response.data;

            // Cập nhật token và trạng thái xác thực
            setToken(data.data.token);
            setIsAuthenticated(true);
            saveToken(data.data.token);

            // Gọi API để lấy dữ liệu người dùng từ UserContext
            const result = await getUserData();
            return result;
        } catch (error) {
            return `Login error: ${error}`;
        }
    };

    const logout = () => {
        setToken(null);
        setIsAuthenticated(false);
        removeToken();
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, token, loading, login, logout, register }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
