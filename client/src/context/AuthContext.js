// AuthProvider.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import publicAxios from "../api/publicAxios";
import privateAxios from "../api/privateAxios";
import { useUser } from "./UserContext";
import { SocketProvider } from "./SocketContext";   // 👈 thêm dòng này

/* ========== AuthContext ========== */
const AuthContext = createContext();

/* ========== AuthProvider ========== */
export const AuthProvider = ({ children }) => {
    /* ----- State ----- */
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const { getUserData } = useUser();

    /* ----- Helpers: lưu / xoá token ----- */
    const saveToken = (t) => sessionStorage.setItem("token", t);
    const removeToken = () => sessionStorage.removeItem("token");

    /* ---------- API wrappers ---------- */
    const register = async (fullName, email, password) => {
        try {
            const { data } = await publicAxios.post("/auth/register", {
                user_full_name: fullName,
                user_email: email,
                user_password: password,
                user_avatar_url: "empty",
                checkMessage: "Register new account",
            });

            setToken(data.data.token);
            setIsAuthenticated(true);
            saveToken(data.data.token);
            return await getUserData();
        } catch (err) {
            console.error(err);
            return err.response?.data?.message || "Register error";
        }
    };

    const login = async (userEmail, userPassword) => {
        try {
            const { data } = await publicAxios.post("/auth/login", {
                user_email: userEmail,
                user_password: userPassword,
                checkMessage: "Login to account",
            });

            setToken(data.data.token);
            setIsAuthenticated(true);
            saveToken(data.data.token);
            return await getUserData();
        } catch (err) {
            console.error(err);
            return err.response?.data?.message || "Login error";
        }
    };

    const logout = async () => {
        // gửi thông tin logout lên server
        try {
            const response = await privateAxios.post("/auth/logout");
            if (response.status !== 200) {
                console.error("Logout failed:", response.data);
                return;
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
        setToken(null);              // 👉 điều này sẽ khiến SocketProvider tự disconnect
        setIsAuthenticated(false);
        removeToken();
    };

    const changePassword = async (email, currentPwd, newPwd) => {
        try {
            const { data } = await privateAxios.post("/auth/changePassword", {
                user_email: email,
                user_password: newPwd,
                user_last_password: currentPwd,
                checkMessage: "Change password",
            });
            if (data.status !== 200) {
                throw new Error(data.message || "Change password failed");
            }
            await logout(); // tự động đăng xuất sau khi đổi mật khẩu
            return data.success;
        } catch (err) {
            return err.response?.data?.message || "Change-pwd error";
        }
    };

    /* ---------- Bootstrapping on first load ---------- */
    useEffect(() => {
        const stored = sessionStorage.getItem("token");
        if (stored) {
            setToken(stored);
            setIsAuthenticated(true);
            getUserData();          // load profile sau refresh
        } else {
            setToken(null);              // 👉 điều này sẽ khiến SocketProvider tự disconnect
            setIsAuthenticated(false);
            removeToken();              // xoá mọi thứ nếu không có token
        }
        setLoading(false);
    }, []);

    /* ---------- Expose context ---------- */
    const contextValue = {
        isAuthenticated,
        token,
        loading,
        login,
        logout,
        register,
        changePassword,
    };

    /* ---------- Wrap children with SocketProvider ---------- */
    return (
        <AuthContext.Provider value={contextValue}>
            {/* Truyền token xuống; SocketProvider sẽ tự connect/disconnect */}
            <SocketProvider token={token}>
                {children}
            </SocketProvider>
        </AuthContext.Provider>
    );
};

/* ========== Hook tiện dùng ========== */
export const useAuth = () => useContext(AuthContext);
