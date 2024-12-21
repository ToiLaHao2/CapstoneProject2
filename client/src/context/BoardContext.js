import React, { createContext, useState, useContext, useEffect } from "react";
import publicAxios from "../api/publicAxios";
import privateAxios from "../api/privateAxios";

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
    const [boards, setBoards] = useState([{}]);

    // Gọi API để lấy danh sách bảng ngay sau khi đăng nhập
    const getAllBoardsByUserId = async () => {
        try {
        } catch (error) {}
    };

    // Gọi API tạo bảng mới đợi xác nhận success thì thêm id bảng
    // mới trả về vào object rồi add vào boards rồi show ra
    const createBoard = async () => {
        try {
        } catch (error) {}
    };

    return (
        <BoardContext.Provider value={{}}>
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    return useContext(BoardContext);
};
