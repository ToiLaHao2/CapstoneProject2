import React, { useState, useEffect } from "react";
import privateAxios from "../../api/privateAxios"
import axios from "axios";

const UploadAvatar = ({ userId }) => {
    const [avatarUrl, setAvatarUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // Khi component mount, kiểm tra avatar từ backend
    useEffect(() => {
        const checkAvatar = async () => {
            try {
                const response = await privateAxios.post(
                    "/user/check-avatar",
                    { user_id: userId }
                );
                if (response.data.success) {
                    setAvatarUrl(response.data.avatar_url);
                }
            } catch (error) {
                console.error("Error checking avatar:", error);
            }
        };
        checkAvatar();
    }, [userId]);

    // Xử lý chọn file
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Hiển thị ảnh preview
        }
    };

    // Upload ảnh lên Cloudinary
    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Vui lòng chọn ảnh trước!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "your_upload_preset"); // Thay bằng Upload Preset của bạn

        try {
            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
                formData
            );
            const uploadedUrl = response.data.secure_url;
            setAvatarUrl(uploadedUrl);

            // Cập nhật avatar vào database backend
            await privateAxios.post("/api/user/update-avatar", {
                user_id: userId,
                avatar_url: uploadedUrl,
            });

            alert("Upload thành công!");
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            alert("Upload thất bại!");
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Upload Avatar</h2>

            {/* Hiển thị ảnh avatar hiện tại */}
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: "150px", borderRadius: "50%" }}
                />
            ) : (
                <p>Chưa có avatar</p>
            )}

            {/* Input chọn ảnh */}
            <input type="file" accept="image/*" onChange={handleFileChange} />

            {/* Hiển thị preview */}
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: "150px", marginTop: "10px" }}
                />
            )}

            {/* Nút Upload */}
            <button
                onClick={handleUpload}
                style={{ display: "block", margin: "10px auto" }}
            >
                Tải Lên Avatar
            </button>
        </div>
    );
};

export default UploadAvatar;
