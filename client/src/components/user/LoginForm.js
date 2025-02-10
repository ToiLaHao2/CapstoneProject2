import React, { useReducer, useState } from "react";
import "./Forms.css";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../../context/BoardContext";

const initialState = {
    email: "",
    password: ""
};

function formReducer(state, action) {
    return {
        ...state,
        [action.name]: action.value
    };
}

const LoginForm = () => {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [alertMessage, setAlertMessage] = useState("");
    const { login } = useAuth();
    const { getUserData } = useUser();
    const { getAllBoardsByUserId } = useBoard();
    const navigate = useNavigate();
    const { email, password } = state;

    const handleLogin = async e => {
        e.preventDefault();

        try {
            // Gọi hàm register từ AuthContext
            const result = await login(email, password, getUserData);
            console.log(result);
            if (result !== "Success") {
                setAlertMessage(result);
            } else {
                await getAllBoardsByUserId();
                alert("Login successful!");
                navigate("/dashboard");
            }
        } catch (error) {
            setAlertMessage("Login failed! Please try again.");
        }
    };

    return (
        <div className="l1-container">
            <div className="form-container">
                <h2>Login</h2>
                {/* Hiển thị thông báo lỗi */}
                {alertMessage &&
                    <div className="alert">
                        {alertMessage}
                    </div>}

                <form onSubmit={handleLogin}>
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
                    <button type="submit">Login</button>
                </form>

                <p className="redirect-message">
                    You don't have an account?{" "}
                    <a href="/signup" className="redirect-link">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
