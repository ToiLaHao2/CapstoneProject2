import React, { createContext, useState, useContext, useCallback } from 'react';
import privateAxios from '../api/privateAxios';

const ConversationContext = createContext();

// Custom hook để sử dụng Context
export const useConversation = () => {
    return useContext(ConversationContext);
};

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm tạo cuộc trò chuyện mới
    const createConversation = useCallback(async (conversationData) => {
        setLoading(true);
        setError(null);
        try {
            // conversationData sẽ bao gồm boardId, title, participants
            // owner và avatarUrl được xử lý ở backend hoặc gửi kèm nếu có
            // Gửi FormData nếu có file (avatar)
            const formData = new FormData();
            for (const key in conversationData) {
                if (key === 'participants') {
                    formData.append(key, JSON.stringify(conversationData[key]));
                } else if (key === 'avatar' && conversationData[key] instanceof File) {
                    formData.append('avatar', conversationData[key]);
                } else {
                    formData.append(key, conversationData[key]);
                }
            }

            const response = await privateAxios.post('/conversation/createConversation', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newConversation = response.data.metadata;
            setConversations((prev) => [newConversation, ...prev]); // Thêm cuộc trò chuyện mới vào đầu danh sách
            return { success: true, conversation: newConversation };
        } catch (err) {
            console.error("Error creating conversation:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to create conversation.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);



    // Hàm lấy danh sách cuộc trò chuyện của người dùng 
    const getConversationsByUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/getConversationsByUser', {
                checkMessage: "Get conversations by user"
                // user_id không cần gửi từ frontend, vì middleware sẽ tự động thêm vào
            });
            setConversations(response.data.metadata);
            return { success: true, conversations: response.data.metadata };
        } catch (err) {
            console.error("Error fetching conversations:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch conversations.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);



    // getConversation (lấy chi tiết 1 conversation)
    const getConversation = useCallback(async (conversationId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/getConversation', {
                conversationId: conversationId,
                checkMessage: "Get conversation"
            });
            const fetchedConversation = response.data.metadata;
            setCurrentConversation(fetchedConversation);
            return { success: true, conversation: fetchedConversation };
        } catch (err) {
            console.error(`Error fetching conversation ${conversationId}:`, err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch conversation.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);



    // addMessageToConversation
    const addMessageToConversation = useCallback(async (conversationId, content) => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/addMessage', {
                conversationId,
                content,
                checkMessage: "Add message to conversation",
            });
            const newMessage = response.data.metadata;

            setCurrentConversation(prevConv => {
                if (!prevConv || prevConv._id !== conversationId) {
                    return prevConv;
                }

                return {
                    ...prevConv,
                    lastMessageId: newMessage._id, // Cập nhật lastMessageId
                    lastMessageAt: newMessage.createdAt // Cập nhật lastMessageAt
                };
            });

            setConversations(prevConversations => prevConversations.map(conv =>
                conv._id === conversationId
                    ? { ...conv, lastMessageId: newMessage._id, lastMessageAt: newMessage.createdAt, message: newMessage.content } // Cập nhật tin nhắn cuối cùng để hiển thị trong danh sách team
                    : conv
            ));


            return { success: true, message: newMessage };
        } catch (err) {
            console.error("Error adding message to conversation:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to add message.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);



    // - addParticipantToConversation
    const addParticipantToConversation = useCallback(async (conversationId, userAddId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/addParticipant', {
                conversationId,
                user_add_id: userAddId, 
                checkMessage: "Add participant to conversation", 
            });

            await getConversation(conversationId); 

            return { success: true, message: response.data.message };
        } catch (err) {
            console.error("Error adding participant to conversation:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to add participant.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [getConversation]);



    // - removeParticipantFromConversation
    const removeParticipantFromConversation = useCallback(async (conversationId, userRemoveId) => {
        setLoading(true); 
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/removeParticipant', {
                conversationId,
                user_remove_id: userRemoveId, 
                checkMessage: "Remove participant from conversation", 
            });

            await getConversation(conversationId);

            return { success: true, message: response.data.message };
        } catch (err) {
            console.error("Error removing participant from conversation:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to remove participant.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [getConversation]);

    const value = {
        conversations,
        currentConversation,
        loading,
        error,
        createConversation,
        getConversationsByUser,
        getConversation,
        addMessageToConversation,
        addParticipantToConversation,
        removeParticipantFromConversation,
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
};