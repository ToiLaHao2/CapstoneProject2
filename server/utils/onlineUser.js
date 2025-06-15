// utils/onlineUsers.js
const onlineUsers = new Map();        // userId → Set(socketId)

/* Thêm socket cho user */
function addUser(userId, socketId) {
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socketId);
}

/* Xoá socket (khi disconnect) */
// remove dựa trên socketId
function removeUser(userId) {
    onlineUsers.delete(userId);
    // user hoàn toàn offline
}

function removeSocket(socketId) {
    for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socketId)) {
            sockets.delete(socketId);
            if (sockets.size === 0) {
                onlineUsers.delete(userId); // xoá user nếu không còn socket nào
            }
            break; // chỉ cần xoá một socket là đủ
        }
    }
}

/* Lấy danh sách socket của user */
function getSockets(userId) {
    return onlineUsers.get(userId) || new Set();
}

module.exports = { addUser, removeUser, getSockets, removeSocket, onlineUsers };
