// utils/onlineUsers.js
const onlineUsers = new Map();        // userId → Set(socketId)

/* Thêm socket cho user */
function addUser(userId, socketId) {
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socketId);
}

/* Xoá socket (khi disconnect) */
function removeUser(userId, socketId) {
    const set = onlineUsers.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) onlineUsers.delete(userId);     // user hoàn toàn offline
}

/* Lấy danh sách socket của user */
function getSockets(userId) {
    return onlineUsers.get(userId) || new Set();
}

module.exports = { addUser, removeUser, getSockets, onlineUsers };
