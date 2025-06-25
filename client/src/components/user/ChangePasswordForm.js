import React, { useReducer, useState } from "react";
import "./Forms.css";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom"; // Import đúng hook

const initialState = {
    current_password: "",
    new_password: "",
    confirm_new_password: ""
};

function formReducer(state, action) {
    // Đảm bảo action.name và action.value được truyền đúng từ handleInputChange
    return {
        ...state,
        [action.name]: action.value
    };
}

const ChangePasswordForm = () => {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [alertMessage, setAlertMessage] = useState("");
    const { changePassword } = useAuth();
    const { user } = useUser();
    // SỬA LỖI Ở ĐÂY: Gọi useNavigate() trực tiếp và gán vào navigate
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

        // Kiểm tra user và user.user_email trước khi gọi API
        if (!user || !user.user_email) {
            setAlertMessage("Không thể thay đổi mật khẩu: Thông tin người dùng không có sẵn.");
            console.error("User object or user_email is missing:", user);
            return;
        }

        try {
            // Giả định changePassword trả về một đối tượng có thuộc tính success và message
            // Hoặc một string "OK" nếu thành công và một string lỗi nếu thất bại.
            // Nếu bạn đã sửa AuthContext như tôi gợi ý trước đó, nó sẽ trả về { success: true/false, message: "..." }
            const res = await changePassword(
                user.user_email,
                current_password,
                new_password
            );

            // Kiểm tra kết quả từ changePassword
            if (res && res !== "OK") { // Nếu res không phải là "OK" (là một thông báo lỗi)
                setAlertMessage(res); // Hiển thị lỗi từ backend/service
                return; // Dừng lại, không hiển thị confirm và navigate
            }

            // Nếu res là "OK" hoặc thành công (ví dụ: res.success === true)
            if (window.confirm("Password changed successfully! Please log in again.")) {
                dispatch({ type: 'RESET_FORM' }); // Reset form
                // LƯU Ý: Nếu AuthContext của bạn có hàm logout, bạn nên gọi nó ở đây
                // Ví dụ: const { changePassword, logout } = useAuth();
                // logout(); // Đăng xuất người dùng để vô hiệu hóa token cũ
                navigate("/login"); // Chỉ navigate khi người dùng bấm OK
            }
        } catch (error) {
            console.error("Error changing password:", error);
            // Cải thiện thông báo lỗi catch
            setAlertMessage(
                `Change password failed! Please try again. ${error.response?.data?.message || error.message || String(error)}`
            );
        }
    };

    const handleInputChange = e => {
        dispatch({
            name: e.target.name, // Đảm bảo input có thuộc tính name="current_password", v.v.
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
                        name="current_password"
                        value={current_password}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        name="new_password"
                        value={new_password}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        name="confirm_new_password"
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