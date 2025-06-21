import React, { createContext, useState, useContext, useCallback } from 'react';
import privateAxios from '../api/privateAxios';
import { useUser } from './UserContext';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useRef } from 'react';

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

    const { isAuthenticated } = useAuth();
    const { user } = useUser(); // Lấy thông tin user từ AuthContext
    const { socket, connected } = useSocket();

    // Ref để theo dõi việc fetch conversations lần đầu tiên khi authenticated
    const initialConversationsFetchDone = useRef(false);

    /**
     * @description Hàm dùng chung để xử lý lỗi từ API
     * @param {Error} err Đối tượng lỗi
     * @param {string} defaultMessage Tin nhắn mặc định nếu không có thông báo lỗi từ server
     * @returns {string} Tin nhắn lỗi đã được xử lý
     */
    const handleError = useCallback((err, defaultMessage) => {
        console.error("Conversation API Error:", err);
        const errorMessage = err.response?.data?.message || err.message || defaultMessage;
        setError(errorMessage);
        return errorMessage;
    }, []);

    // --- Các hàm API calls ---

     // Hàm tạo cuộc trò chuyện mới
    const createConversation = useCallback(async (conversationData) => {
        setLoading(true);
        setError(null);
        try {
            // Kiểm tra xác thực ở frontend trước khi gọi API
            if (!isAuthenticated || !user?._id) {
                const errMsg = "User not authenticated.";
                setError(errMsg);
                return { success: false, error: errMsg };
            }

            const formData = new FormData();
            for (const key in conversationData) {
                if (key === 'participants') {
                    // participants có thể là mảng các ID, cần chuyển thành JSON string
                    formData.append(key, JSON.stringify(conversationData[key]));
                } else if (key === 'avatar' && conversationData[key] instanceof File) {
                    formData.append('file', conversationData[key]); // Backend mong đợi 'file'
                } else {
                    formData.append(key, conversationData[key]);
                }
            }
            // KHÔNG GỬI user_id Ở ĐÂY, vì middleware sẽ tự thêm vào req.body hoặc req.user
            // formData.append('user_id', user._id); 

            const response = await privateAxios.post('/conversation/createConversation', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseData = response.data.metadata;
            // Nếu API trả về "Conversation exists", có nghĩa là đã có conversation
            if (response.data.message === "Conversation exists") {
                // responseData ở đây là _id của conversation đã tồn tại
                const existingConv = await getConversation(responseData); 
                // Không thêm vào danh sách conversations nếu nó đã tồn tại
                return { success: true, conversation: existingConv, message: "Conversation already exists." };
            } else {
                setConversations((prev) => [responseData, ...prev]); // Thêm cuộc trò chuyện mới vào đầu danh sách
                setCurrentConversation(responseData); // Set làm cuộc trò chuyện hiện tại
                return { success: true, conversation: responseData };
            }
        } catch (err) {
            const errorMessage = handleError(err, "Failed to create conversation.");
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, handleError, getConversation]); // Thêm getConversation vào dependencies

    // Hàm lấy danh sách cuộc trò chuyện của người dùng
    const getConversationsByUser = useCallback(async () => {
        if (!isAuthenticated || !user?._id) {
            console.log("Skipping getConversationsByUser: User not authenticated.");
            setConversations([]); // Xóa danh sách nếu không xác thực
            setLoading(false);
            return { success: false, error: "User not authenticated." };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/getConversationsByUser', {
                checkMessage: "Get conversations by user",
                // user_id KHÔNG CẦN GỬI Ở ĐÂY, middleware sẽ thêm vào
            });
            setConversations(response.data.metadata);
            return { success: true, conversations: response.data.metadata };
        } catch (err) {
            const errorMessage = handleError(err, "Failed to fetch conversations.");
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, handleError]); // Vẫn cần user để kiểm tra isAuthenticated

    // getConversation (lấy chi tiết 1 conversation)
    const getConversation = useCallback(async (conversationId) => {
        if (!isAuthenticated || !user?._id) {
            console.log("Skipping getConversation: User not authenticated.");
            setLoading(false);
            return { success: false, error: "User not authenticated." };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await privateAxios.post('/conversation/getConversation', {
                conversationId: conversationId,
                // user_id KHÔNG CẦN GỬI Ở ĐÂY, middleware sẽ thêm vào
                checkMessage: "Get conversation"
            });
            const fetchedConversation = response.data.metadata;
            setCurrentConversation(fetchedConversation);
            return { success: true, conversation: fetchedConversation };
        } catch (err) {
            const errorMessage = handleError(err, `Failed to fetch conversation ${conversationId}.`);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, handleError]); // Vẫn cần user để kiểm tra isAuthenticated


    // addMessageToConversation
    const addMessageToConversation = useCallback(async (conversationId, content) => {
        setLoading(true);
        setError(null);
        try {
            if (!isAuthenticated || !user?._id) {
                const errMsg = "User not authenticated.";
                setError(errMsg);
                return { success: false, error: errMsg };
            }

            const response = await privateAxios.post('/conversation/addMessage', {
                conversationId,
                content,
                // user_id KHÔNG CẦN GỬI Ở ĐÂY, middleware sẽ thêm vào
                checkMessage: "Add message to conversation",
            });
            const newMessage = response.data.metadata;

            // Cập nhật currentConversation
            setCurrentConversation(prevConv => {
                if (!prevConv || prevConv._id !== conversationId) {
                    return prevConv;
                }
                // Giả định `currentConversation` có trường `messages` là một mảng
                // Nếu không, bạn cần fetch lại toàn bộ conversation để có tin nhắn mới
                const updatedMessages = prevConv.messages ? [...prevConv.messages, newMessage] : [newMessage];
                return {
                    ...prevConv,
                    messages: updatedMessages,
                    lastMessageId: newMessage._id,
                    lastMessageAt: newMessage.createdAt,
                };
            });

            // Cập nhật danh sách conversations để tin nhắn cuối cùng hiển thị đúng
            setConversations(prevConversations => {
                const updatedConversations = prevConversations.map(conv => {
                    if (conv._id === conversationId) {
                        return {
                            ...conv,
                            lastMessageId: newMessage._id,
                            lastMessageAt: newMessage.createdAt,
                            lastMessage: newMessage.content // Cập nhật tin nhắn cuối cùng để hiển thị trong danh sách
                        };
                    }
                    return conv;
                });
                // Đảm bảo cuộc trò chuyện vừa có tin nhắn mới được đưa lên đầu danh sách
                const conversationToMove = updatedConversations.find(conv => conv._id === conversationId);
                if (conversationToMove) {
                    // Lọc bỏ cuộc trò chuyện cũ khỏi vị trí cũ và thêm vào đầu
                    return [
                        conversationToMove,
                        ...updatedConversations.filter(conv => conv._id !== conversationId)
                    ];
                }
                return updatedConversations;
            });

            return { success: true, message: newMessage };
        } catch (err) {
            const errorMessage = handleError(err, "Failed to add message.");
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, handleError]);


    // addParticipantToConversation
    const addParticipantToConversation = useCallback(async (conversationId, userAddId) => {
        setLoading(true);
        setError(null);
        try {
            if (!isAuthenticated || !user?._id) {
                const errMsg = "User not authenticated.";
                setError(errMsg);
                return { success: false, error: errMsg };
            }

            const response = await privateAxios.post('/conversation/addParticipant', {
                conversationId,
                user_add_id: userAddId,
                // user_id KHÔNG CẦN GỬI Ở ĐÂY, middleware sẽ thêm vào
                checkMessage: "Add participant to conversation",
            });

            // Sau khi thêm thành công, fetch lại conversation chi tiết để cập nhật participants
            // và cũng cập nhật danh sách conversations
            await getConversation(conversationId);
            await getConversationsByUser();

            return { success: true, message: response.data.message };
        } catch (err) {
            const errorMessage = handleError(err, "Failed to add participant.");
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getConversation, getConversationsByUser, handleError]);


    // removeParticipantFromConversation
    const removeParticipantFromConversation = useCallback(async (conversationId, userRemoveId) => {
        setLoading(true);
        setError(null);
        try {
            if (!isAuthenticated || !user?._id) {
                const errMsg = "User not authenticated.";
                setError(errMsg);
                return { success: false, error: errMsg };
            }

            const response = await privateAxios.post('/conversation/removeParticipant', {
                conversationId,
                user_remove_id: userRemoveId,
                // user_id KHÔNG CẦN GỬI Ở ĐÂY, middleware sẽ thêm vào (người thực hiện việc xóa)
                checkMessage: "Remove participant from conversation",
            });

            // Sau khi xóa thành công, fetch lại conversation chi tiết để cập nhật participants
            // và cũng cập nhật danh sách conversations
            await getConversation(conversationId);
            await getConversationsByUser();


            return { success: true, message: response.data.message };
        } catch (err) {
            const errorMessage = handleError(err, "Failed to remove participant.");
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getConversation, getConversationsByUser, handleError]);

    // --- Socket.IO Handlers ---

    // Lắng nghe sự kiện socket để cập nhật UI
    useEffect(() => {
        // Chỉ lắng nghe socket nếu đã kết nối và người dùng đã xác thực
        if (!connected || !socket || !isAuthenticated || !user?._id) return;

        // Xử lý khi có conversation mới được tạo (bởi người khác)
        const handleConversationCreated = async () => {
            console.log("Socket: conversation:allmember:created received, re-fetching conversations.");
            await getConversationsByUser(); // Fetch lại toàn bộ danh sách
        };

        // Xử lý khi có tin nhắn mới trong conversation
        const handleNewMessage = (newMessage) => {
            console.log("Socket: conversation:allmember:addmessage received:", newMessage);
            // Nếu tin nhắn thuộc conversation đang mở, cập nhật nó
            if (currentConversation && currentConversation._id === newMessage.conversationId) {
                setCurrentConversation(prevConv => {
                    // Đảm bảo prevConv không null và có messages (hoặc tạo mới nếu chưa có)
                    const updatedMessages = prevConv.messages ? [...prevConv.messages, newMessage] : [newMessage];
                    return {
                        ...prevConv,
                        messages: updatedMessages,
                        lastMessageId: newMessage._id,
                        lastMessageAt: newMessage.createdAt,
                    };
                });
            }

            // Cập nhật danh sách conversations (để lastMessage hiển thị đúng)
            setConversations(prevConversations => {
                const updatedConversations = prevConversations.map(conv => {
                    if (conv._id === newMessage.conversationId) {
                        return {
                            ...conv,
                            lastMessageId: newMessage._id,
                            lastMessageAt: newMessage.createdAt,
                            lastMessage: newMessage.content
                        };
                    }
                    return conv;
                });
                // Đảm bảo cuộc trò chuyện vừa có tin nhắn mới được đưa lên đầu danh sách
                const conversationToMove = updatedConversations.find(conv => conv._id === newMessage.conversationId);
                if (conversationToMove) {
                    return [
                        conversationToMove,
                        ...updatedConversations.filter(conv => conv._id !== newMessage.conversationId)
                    ];
                }
                return updatedConversations;
            });
        };

        // Xử lý khi có thành viên mới được thêm vào cuộc trò chuyện
        const handleAddMember = async (newMember) => {
            console.log("Socket: conversation:allmember:addmember received:", newMember);
            // Nếu người dùng hiện tại là thành viên của cuộc trò chuyện được thêm người mới
            if (currentConversation && currentConversation.participants.some(p => String(p._id || p) === String(user._id))) {
                await getConversation(currentConversation._id); // Fetch lại current conversation để cập nhật participants
            }
            // Ngoài ra, có thể cần cập nhật danh sách conversations nếu người dùng hiện tại được thêm vào
            // hoặc nếu người dùng hiện tại đang xem danh sách conversations
            await getConversationsByUser();
        };

        // Xử lý khi có thành viên bị xóa khỏi cuộc trò chuyện
        const handleRemoveMember = async (removedMemberId) => {
            console.log("Socket: conversation:allmember:removemember received:", removedMemberId);
            // Nếu người dùng hiện tại bị xóa khỏi conversation đang mở
            if (currentConversation && String(removedMemberId) === String(user._id) && currentConversation._id) {
                setCurrentConversation(null); // Clear current conversation if user is removed
                console.log("You were removed from the current conversation.");
            }
            // Luôn fetch lại danh sách conversations
            await getConversationsByUser();
        };


        socket.on("conversation:allmember:created", handleConversationCreated);
        socket.on("conversation:allmember:addmessage", handleNewMessage);
        socket.on("conversation:allmember:addmember", handleAddMember);
        socket.on("conversation:allmember:removemember", handleRemoveMember);

        return () => {
            socket.off("conversation:allmember:created", handleConversationCreated);
            socket.off("conversation:allmember:addmessage", handleNewMessage);
            socket.off("conversation:allmember:addmember", handleAddMember);
            socket.off("conversation:allmember:removemember", handleRemoveMember);
        };
    }, [connected, socket, isAuthenticated, user, currentConversation, getConversation, getConversationsByUser]);


    // Effect để tải conversations khi component mount hoặc khi isAuthenticated thay đổi
    useEffect(() => {
        if (isAuthenticated && user?._id && !initialConversationsFetchDone.current) {
            console.log("Fetching initial conversations for authenticated user.");
            getConversationsByUser();
            initialConversationsFetchDone.current = true;
        } else if (!isAuthenticated && initialConversationsFetchDone.current) {
            // Reset trạng thái khi người dùng đăng xuất
            console.log("User logged out, resetting conversation state.");
            setConversations([]);
            setCurrentConversation(null);
            initialConversationsFetchDone.current = false;
        }
    }, [isAuthenticated, user, getConversationsByUser]);


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
        setCurrentConversation // Thêm để có thể reset hoặc set conversation từ bên ngoài
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
};