// ConversationContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import privateAxios from '../api/privateAxios'; // Assuming this is correctly configured with auth headers
// import { useUser } from './UserContext'; // Not used in this context, but good to keep if needed elsewhere
// import { useAuth } from './AuthContext'; // Not used in this context, but good to keep if needed elsewhere
import { useSocket } from './SocketContext'; // Assuming this provides the `socket` instance
import { useAuth } from './AuthContext';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    // State for conversations list, selected conversation, messages, loading/error states
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true); // New: Tracks if there are more older messages
    const { token } = useAuth();

    // Get the socket instance from your SocketContext
    const { socket, connected } = useSocket();

    // Ref to store the current conversation ID to avoid stale closures in socket event listeners
    const currentConversationIdRef = useRef(null);

    // Update the ref whenever selectedConversation changes, ensuring socket handlers have the latest ID
    useEffect(() => {
        currentConversationIdRef.current = selectedConversation?._id;
    }, [selectedConversation]);

    // 1. Fetch all conversations for the logged-in user
    const fetchConversations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Ensure user_id is sent in the body as per your backend controller
            const response = await privateAxios.post(`/conversation/getConversationsByUser`, { checkMessage: "Get conversations by user" });
            if (response.data.success) {
                // Sort conversations by last message time to show most recent first
                const sortedConversations = response.data.data.sort((a, b) => {
                    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
                    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
                setConversations(sortedConversations);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch conversations');
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [token]); // Dependency: userId to refetch if it changes

    // 2. Fetch messages for a specific conversation with pagination
    /**
     * Fetches messages for a specific conversation with pagination.
     * @param {string} conversationId - The ID of the conversation to fetch messages from.
     * @param {string | null} [beforeId=null] - The ID of the oldest message currently displayed. Messages older than this will be fetched.
     * @param {boolean} [isInitialLoad=true] - If true, replaces existing messages; otherwise, prepends them.
     */
    const fetchMessages = useCallback(async (conversationId, beforeMessageId = null, clearExisting = true) => {
        if (!conversationId) {
            console.warn("Cannot fetch messages: conversationId is null.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post("/message/loadMessages", {
                conversationId: conversationId,
                beforeId: beforeMessageId, // <-- Backend sẽ dùng ID này
                checkMessage: "Load messages"
            });

            if (response.data.success) {
                const fetchedMessages = response.data.data;
                if (Array.isArray(fetchedMessages)) {
                    // Sắp xếp tin nhắn theo createdAt theo thứ tự tăng dần (cũ nhất trước)
                    // Đây là cực kỳ quan trọng để messages[0] luôn là tin nhắn cũ nhất
                    const sortedMessages = fetchedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                    if (clearExisting) {
                        // Trường hợp tải tin nhắn ban đầu cho cuộc trò chuyện mới được chọn
                        setMessages(sortedMessages);
                    } else {
                        // Trường hợp tải thêm tin nhắn cũ hơn (kéo lên)
                        // Nối MẢNG TIN NHẮN MỚI vào ĐẦU mảng tin nhắn HIỆN CÓ
                        setMessages(prevMessages => [...sortedMessages, ...prevMessages]);
                    }
                    // Cập nhật hasMoreMessages dựa trên số lượng tin nhắn trả về
                    setHasMoreMessages(fetchedMessages.length === 20);
                } else {
                    console.warn("API returned non-array payload for messages:", fetchedMessages);
                    setMessages(clearExisting ? [] : messages); // Giữ nguyên hoặc đặt rỗng
                    setHasMoreMessages(false);
                }
            } else {
                setError(response.data.message);
                setMessages(clearExisting ? [] : messages); // Giữ nguyên hoặc đặt rỗng
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch messages');
            console.error('Error fetching messages:', err);
            setMessages(clearExisting ? [] : messages); // Giữ nguyên hoặc đặt rỗng
        } finally {
            setLoading(false);
        }
    }, [privateAxios, messages]); // Dependency: userId for the API call

    // 3. Create a new conversation
    const createConversation = async (boardId, title, participants, file = null) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('boardId', boardId);
            formData.append('title', title);
            formData.append('checkMessage', "Create new conversation");
            participants.forEach(p => formData.append('participants[]', p._id)); // Assuming participants is an array of IDs
            if (file) {
                formData.append('file', file);
            }

            const response = await privateAxios.post("/conversation/createConversation", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important for file uploads
                }
            });

            if (response.data.success) {
                if (response.data.message === "Conversation exists") {
                    const existingConvId = response.data.data;
                    const existingConv = conversations.find(conv => conv._id === existingConvId);
                    if (existingConv) {
                        setSelectedConversation(existingConv); // Select existing if found in current list
                    } else {
                        await fetchConversations(); // Re-fetch all if existing is not in current list
                    }
                } else {
                    setConversations(prev => [response.data.data, ...prev]); // Add new conversation
                    setSelectedConversation(response.data.data); // Select the newly created one
                }
                return { success: true, conversation: response.data.data };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create conversation');
            console.error('Error creating conversation:', err);
            return { success: false, message: err.response?.data?.message || 'Internal Server Error' };
        } finally {
            setLoading(false);
        }
    };

    // 4. Add a message to an existing conversation
    const addMessageToConversation = async (conversationId, content) => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post(`/conversation/addMessage`, {
                conversationId,
                content,
                checkMessage: "Add message to conversation"
            });
            if (response.data.success) {
                // Optimistically update messages locally
                setMessages(prevMessages => [...prevMessages, response.data.data]);
                // Update the last message info in the conversations list
                setConversations(prevConvs =>
                    prevConvs.map(conv =>
                        String(conv._id) === String(conversationId)
                            ? { ...conv, lastMessageId: response.data.data._id, lastMessageAt: response.data.data.createdAt }
                            : conv
                    ).sort((a, b) => { // Re-sort conversations by last message time
                        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
                        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
                        return dateB.getTime() - dateA.getTime();
                    })
                );
                return { success: true };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
            console.error('Error adding message:', err);
            return { success: false, message: err.response?.data?.message || 'Internal Server Error' };
        } finally {
            setLoading(false);
        }
    };

    // 5. Add a participant to a conversation
    const addParticipantToConversation = async (conversationId, userToAddId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post(`/conversation/addParticipant`, {
                conversationId,
                user_add_id: userToAddId,
                checkMessage: "Add participant to conversation"
            });
            if (response.data.success) {
                // Assuming backend's sendSuccess for addParticipant returns the added user's full details
                // e.g., sendSuccess(res, 200, 'Participant added', userToAdd);
                // If not, you might need to fetch the user details separately or adjust the backend.
                const userToAddDetails = response.data.payload; // Assuming 'payload' contains user details

                setSelectedConversation(prev => {
                    if (!prev) return null;
                    // Check if the participant is already in the list to avoid duplicates
                    const isAlreadyParticipant = prev.participants.some(p => String(p._id) === String(userToAddId));
                    if (isAlreadyParticipant) {
                        return prev; // No change needed
                    }
                    return {
                        ...prev,
                        participants: [...prev.participants, userToAddDetails] // Add full user object
                    };
                });
                return { success: true };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add participant');
            console.error('Error adding participant:', err);
            return { success: false, message: err.response?.data?.message || 'Internal Server Error' };
        } finally {
            setLoading(false);
        }
    };

    // 6. Remove a participant from a conversation (only owner can do this)
    const removeParticipantFromConversation = async (conversationId, userToRemoveId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post(`/conversation/removeParticipant`, {
                conversationId,
                user_remove_id: userToRemoveId,
                checkMessage: "Remove participant from conversation", // Ensure userId is sent (requester ID, presumably owner)
            });
            if (response.data.success) {
                // Update the selected conversation's participants locally
                setSelectedConversation(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        participants: prev.participants.filter(p => String(p._id) !== String(userToRemoveId))
                    };
                });
                return { success: true };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove participant');
            console.error('Error removing participant:', err);
            return { success: false, message: err.response?.data?.message || 'Internal Server Error' };
        } finally {
            setLoading(false);
        }
    };

    // 7. Select a conversation and fetch its initial messages
    const selectConversation = useCallback(async (conversationId) => {
        setLoading(true);
        setError(null);
        try {
            // Use privateAxios for getting conversation details
            const response = await privateAxios.post(`/conversation/getConversation`,
                {
                    conversationId: conversationId,
                    checkMessage: "Get conversation"
                }
            );
            if (response.data.success) {
                setSelectedConversation(response.data.data);
                setMessages([]); // Clear messages before loading new ones
                setHasMoreMessages(true); // Reset hasMoreMessages for the new conversation
                // Fetch initial set of messages for the selected conversation
                await fetchMessages(conversationId, null, true);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get conversation details');
            console.error('Error getting conversation details:', err);
        } finally {
            setLoading(false);
        }
    }, [user, fetchMessages]); // Dependencies: userId, fetchMessages

    // --- Socket.IO Handlers ---
    useEffect(() => {
        if (!connected) return;
        /* ---------- Cuộc trò chuyện mới được tạo (cho tất cả thành viên) ----------- */
        const onConversationCreated = () => {
            console.log('Socket event: conversation:allmember:created - Re-fetching conversations...');
            fetchConversations(); // Re-fetch to get the new conversation in the list
        };

        /* ---------- Tin nhắn mới được thêm (cho tất cả thành viên) ----------- */
        const onMessageAdded = (newMessage) => {
            console.log('Socket event: conversation:allmember:addmessage', newMessage);

            console.log("Tin nhắn nhận được từ socket:", newMessage);

            // Only add message to the `messages` state if it belongs to the currently selected conversation
            if (String(currentConversationIdRef.current) === String(newMessage.conversationId)) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }

            // Always update the 'lastMessageId' and 'lastMessageAt' for the relevant conversation
            setConversations(prevConvs =>
                prevConvs.map(conv =>
                    String(conv._id) === String(newMessage.conversationId)
                        ? { ...conv, lastMessageId: newMessage, lastMessageAt: newMessage.createdAt }
                        : conv
                ).sort((a, b) => { // Re-sort to bring conversation with new message to top
                    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
                    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                })
            );
        };

        /* ---------- Thành viên mới được thêm vào cuộc trò chuyện ----------- */
        const onMemberAdded = (addedUser) => {
            console.log('Socket event: conversation:allmember:addmember', addedUser);

            // If the added user is the current logged-in user, re-fetch conversations
            // (e.g., if they were added to a conversation they weren't in before)
            if (String(addedUser._id) === String(user._id)) {
                fetchConversations();
            }

            // Update the selected conversation's participants if it's the current one being viewed
            if (currentConversationIdRef.current && String(currentConversationIdRef.current) === String(addedUser.conversationId)) {
                setSelectedConversation(prev => {
                    if (!prev) return null;
                    const isAlreadyParticipant = prev.participants.some(p => String(p._id) === String(addedUser._id));
                    if (isAlreadyParticipant) {
                        return prev; // Avoid adding duplicate if already present
                    }
                    return {
                        ...prev,
                        participants: [...prev.participants, addedUser] // Assuming `addedUser` contains full user details from backend socket emit
                    };
                });
            }
        };

        /* ---------- Thành viên bị xóa khỏi cuộc trò chuyện ----------- */
        const onMemberRemoved = (removedUserId, conversationId) => {
            console.log('Socket event: conversation:allmember:removemember', removedUserId, conversationId);

            // If the removed user is the current logged-in user
            if (String(removedUserId) === String(user._id)) {
                // Filter out the conversation from the user's list
                setConversations(prevConvs => prevConvs.filter(conv => String(conv._id) !== String(conversationId)));
                // If the removed conversation was the selected one, deselect it and clear messages
                if (String(currentConversationIdRef.current) === String(conversationId)) {
                    setSelectedConversation(null);
                    setMessages([]);
                    setHasMoreMessages(false); // No messages to load for this non-existent conversation
                }
            } else {
                // If another user was removed from the currently selected conversation
                if (currentConversationIdRef.current && String(currentConversationIdRef.current) === String(conversationId)) {
                    setSelectedConversation(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            participants: prev.participants.filter(p => String(p._id) !== String(removedUserId))
                        };
                    });
                }
            }
        };

        // Đăng ký các sự kiện Socket.IO
        socket.on('conversation:allmember:created', onConversationCreated);
        socket.on('conversation:allmember:addmessage', onMessageAdded);
        socket.on('conversation:allmember:addmember', onMemberAdded);
        socket.on('conversation:allmember:removemember', onMemberRemoved);

        // Cleanup: Hủy đăng ký các sự kiện khi component unmounts hoặc dependencies thay đổi
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('conversation:allmember:created', onConversationCreated);
            socket.off('conversation:allmember:addmessage', onMessageAdded);
            socket.off('conversation:allmember:addmember', onMemberAdded);
            socket.off('conversation:allmember:removemember', onMemberRemoved);
        };
    }, [socket, user, fetchConversations, currentConversationIdRef, setMessages, setConversations, setSelectedConversation, setHasMoreMessages]); // Dependencies for useEffect

    // Initial fetch of conversations when the component mounts or userId changes
    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]); // Dependencies for initial fetch

    // The context value to be provided to consumers
    const contextValue = {
        conversations,
        selectedConversation,
        messages,
        loading,
        error,
        hasMoreMessages, // Expose hasMoreMessages for pagination UI
        fetchConversations,
        fetchMessages,
        createConversation,
        addMessageToConversation,
        addParticipantToConversation,
        removeParticipantFromConversation,
        selectConversation,
    };

    return (
        <ConversationContext.Provider value={contextValue}>
            {children}
        </ConversationContext.Provider>
    );
};

// Custom hook to use the conversation context
export const useConversation = () => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('useConversation must be used within a ConversationProvider');
    }
    return context;
};