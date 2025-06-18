// utils/onlineUsers.js
const onlineUsers = new Map();        // userId → Set(socketId)

/* Thêm socket cho user */
function addUser(userId, socketId) {
    onlineUsers.set(userId, socketId);
}

/* Xoá socket (khi disconnect) */
// remove dựa trên socketId
function removeUser(userId) {
    onlineUsers.delete(userId);
    // user hoàn toàn offline
}

function removeSocket(socketId) {
    for (const [userId, sktId] of onlineUsers) {
        if (sktId === socketId) {
            onlineUsers.delete(userId);
            break;
        }
    }
}


/* Lấy danh sách socket của user */
function getSockets(userId) {
    return onlineUsers.get(userId) || new Set();
}

module.exports = { addUser, removeUser, getSockets, removeSocket, onlineUsers };
