import React, { useReducer, useState } from "react";
import "./Forms.css";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

// Khởi tạo state ban đầu
const initialState = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
};

// Hàm reducer để cập nhật state dựa trên action
function formReducer(state, action) {
    return {
        ...state,
        [action.name]: action.value
    };
}

const SignupForm = () => {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [alertMessage, setAlertMessage] = useState("");
    const { register } = useAuth();
    const { getUserData } = useUser();

    const { fullName, email, password, confirmPassword } = state;

    // Xử lý khi submit form
    const handleSubmit = async e => {
        e.preventDefault();

        // Kiểm tra mật khẩu khớp
        if (password !== confirmPassword) {
            setAlertMessage("Passwords do not match!");
            return;
        }

        try {
            // Gọi hàm register từ AuthContext
            await register(fullName, email, password, getUserData);
            setAlertMessage("Registration successful!");
        } catch (error) {
            setAlertMessage("Registration failed! Please try again.");
        }
    };

    return (
        <div className="form-container">
            <h2>Sign Up</h2>

            {/* Hiển thị thông báo lỗi */}
            {alertMessage &&
                <p className="alert">
                    {alertMessage}
                </p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => dispatch(e.target)}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => dispatch(e.target)}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => dispatch(e.target)}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => dispatch(e.target)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignupForm;
