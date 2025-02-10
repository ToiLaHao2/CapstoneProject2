import React, { useReducer, useState } from "react";
import "./Forms.css";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const initialState = {
    current_password: "",
    new_password: "",
    confirm_new_password: ""
};

function formReducer(state, action) {
    return {
        ...state,
        [action.name]: action.value
    };
}

const ChangePasswordForm = () => {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [alertMessage, setAlertMessage] = useState("");
    const { changePassword, logout } = useAuth();
    const { user } = useUser();
    console.log(user);
    const navigate = useNavigate();

    const { current_password, new_password, confirm_new_password } = state;

    // Xử lý khi submit form
    const handleSubmit = async e => {
        e.preventDefault();

        // Kiểm tra mật khẩu khớp
        if (new_password.trim() !== confirm_new_password.trim()) {
            setAlertMessage("Passwords do not match!");
            return;
        }

        try {
            const result = await changePassword(
                user.user_email,
                current_password,
                new_password
            );

            if (result === "Success") {
                alert("Change password successful! Please login again.");
                await logout();
                navigate("/login");
            } else {
                setAlertMessage(result);
            }
        } catch (error) {
            setAlertMessage(
                `Change password failed! Please try again.${error}`
            );
        }
    };

    const handleInputChange = e => {
        dispatch({
            name: e.target.name,
            value: e.target.value
        });
    };

    return (
        <div className="l1-container">
            <div className="form-container">
                <h2>Change Password</h2>
                {alertMessage &&
                    <p className="alert">
                        {alertMessage}
                    </p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Current Password"
                        name="current_password" // Sửa tên cho khớp state
                        value={current_password}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        name="new_password" // Sửa tên cho khớp state
                        value={new_password}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        name="confirm_new_password" // Sửa tên cho khớp state
                        value={confirm_new_password}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">Change Password</button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordForm;
