import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./Chat.css"; // Import CSS file for Chat component
import { useConversation } from "../../context/ConversationContext";
import { useUser } from "../../context/UserContext";

// Helper function to format timestamp
const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
};

// --- ConversationList Component ---
// This component displays the list of conversations (sidebar)
const ConversationList = ({ onConversationClick, selectedConversationId }) => {
    const { conversations, loading, error } = useConversation();
    const { user } = useUser(); // Get current user for participant logic

    // Memoize the conversation data to avoid unnecessary re-renders
    const conversationItems = useMemo(() => {
        if (loading) return <p className="conversation-list__status">Loading conversations...</p>;
        if (error) return <p className="conversation-list__status conversation-list__status--error">Error: {error}</p>;
        if (conversations.length === 0) return <p className="conversation-list__status">No conversations found.</p>;

        return conversations.map((conv) => {
            const lastMessageText = conv.lastMessageId?.content || "No messages yet.";
            const lastMessageTime = conv.lastMessageId?.createdAt ? formatTime(conv.lastMessageId.createdAt) : '';

            // Determine conversation name and avatar
            let conversationName = conv.title;
            let conversationAvatar = conv.file_url; // Use file_url for group chats if available

            if (!conversationName) { // If no specific title, it's likely a 1-on-1 chat
                const otherParticipant = conv.participants.find(p => String(p._id) !== String(user._id));
                conversationName = otherParticipant ? otherParticipant.user_full_name : 'Anonymous Chat';
                conversationAvatar = otherParticipant?.user_avatar_url || conversationName.charAt(0);
            } else if (!conversationAvatar) { // If title exists but no file_url (for group chat without custom avatar)
                conversationAvatar = conversationName.charAt(0);
            }

            return (
                <div
                    className={`conversation-item ${String(conv._id) === String(selectedConversationId) ? "conversation-item--selected" : ""}`}
                    key={conv._id}
                    onClick={() => onConversationClick(conv._id)}
                >
                    <div className="conversation-item__avatar">
                        {conversationAvatar && conversationAvatar.startsWith('http') ? (
                            <img src={conversationAvatar} alt="Avatar" />
                        ) : (
                            <span>{conversationAvatar ? conversationAvatar.charAt(0).toUpperCase() : 'C'}</span> // Fallback to first letter
                        )}
                    </div>
                    <div className="conversation-item__details">
                        <h4 className="conversation-item__name">{conversationName}</h4>
                        <p className="conversation-item__last-message">{lastMessageText}</p>
                    </div>
                    <div className="conversation-item__time">
                        <span>{lastMessageTime}</span>
                        {/* You'd integrate unread count/indicator here based on your backend */}
                        {/* {conv.unreadCount > 0 && <span className="conversation-item__unread-count">{conv.unreadCount}</span>} */}
                    </div>
                </div>
            );
        });
    }, [conversations, loading, error, selectedConversationId, onConversationClick, user._id]);


    return (
        <div className="chat-sidebar">
            <div className="chat-sidebar__header">
                <h3>Messages</h3>
                <div className="chat-sidebar__search">
                    <input type="text" placeholder="Search..." />
                    <button><i className="fa fa-search"></i></button>
                </div>
            </div>
            <div className="chat-sidebar__list">
                {conversationItems}
            </div>
        </div>
    );
};

// --- ChatWindow Component ---
// This component displays the messages for the selected conversation
const ChatWindow = ({
    selectedConversation,
    messages,
    loading,
    error,
    hasMoreMessages,
    fetchMessages,
    addMessageToConversation,
    userId,
    currentChatHeader // Pass the memoized header info
}) => {
    const [newMessageContent, setNewMessageContent] = useState("");
    const messagesEndRef = useRef(null); // Ref for auto-scrolling to the latest message
    const messagesContainerRef = useRef(null); // Ref for the scrollable message area

    // Effect to scroll to the bottom when new messages arrive (or initial load)
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (newMessageContent.trim() === "" || !selectedConversation) return;

        const conversationId = selectedConversation._id;
        const result = await addMessageToConversation(conversationId, newMessageContent);

        if (result.success) {
            setNewMessageContent("");
        } else {
            // Handle error, maybe show a toast notification
            console.error("Failed to send message:", result.message);
            // Optionally, display error to user
        }
    };

    // Handle infinite scrolling for messages (load older messages)
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        // Kiểm tra nếu cuộn đến đầu container, có thêm tin nhắn cũ để tải và không đang trong quá trình tải
        if (container && container.scrollTop === 0 && hasMoreMessages && !loading) {
            // Lấy _id của tin nhắn ĐẦU TIÊN (cũ nhất) trong danh sách hiện tại
            const oldestMessageId = messages.length > 0 ? messages[0]._id : null;

            if (selectedConversation && oldestMessageId) {
                console.log("Fetching older messages before ID:", oldestMessageId); // Debugging
                // Gọi fetchMessages với oldestMessageId và clearExisting = false (để nối thêm tin nhắn vào đầu mảng)
                fetchMessages(selectedConversation._id, oldestMessageId, false);
            }
        }
    }, [messages, hasMoreMessages, loading, selectedConversation, fetchMessages]);

    // Attach scroll event listener
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => {
                container.removeEventListener("scroll", handleScroll);
            };
        }
    }, [handleScroll]);

    return (
        <div className="chat-main">
            <div className="chat-main__header">
                <div className="user-info">
                    <div className="user-info__avatar">
                        {currentChatHeader.avatar && currentChatHeader.avatar.startsWith('http') ? (
                            <img src={currentChatHeader.avatar} alt="Avatar" />
                        ) : (
                            <span>{currentChatHeader.avatar ? currentChatHeader.avatar.charAt(0).toUpperCase() : 'S'}</span> // Fallback for no avatar
                        )}
                    </div>
                    <div className="user-info__details">
                        <h4>{currentChatHeader.name}</h4>
                        {/* Optional: Add active status, last seen, etc. */}
                    </div>
                </div>
                {/* Optional: Add chat settings/call buttons here */}
            </div>

            <div className="chat-main__messages-container" ref={messagesContainerRef}>
                {/* ... các phần loading/error/no conversation */}

                {messages.map((message) => (
                    <div
                        key={message._id}
                        // ✅ SỬA ĐỔI Ở ĐÂY: So sánh message.sender._id với userId
                        className={`message-bubble ${String(message.senderId._id) === String(userId) ? "message-bubble--sent" : "message-bubble--received"}`}
                    >
                        {/* Optional: Display sender name above message for received messages in group chats */}
                        {String(message.senderId._id) !== String(userId) && (
                            <span className="message-bubble__sender-name">{message.senderId.user_full_name}</span>
                        )}
                        <p className="message-bubble__content">{message.content}</p>
                        <span className="message-bubble__timestamp">{formatTime(message.createdAt)}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {selectedConversation && (
                <div className="chat-main__input-area">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleSendMessage();
                            }
                        }}
                        disabled={loading} // Disable input while sending/loading
                    />
                    <button onClick={handleSendMessage} disabled={loading || newMessageContent.trim() === ""}>
                        Send
                    </button>
                </div>
            )}
        </div>
    );
};


// --- Main Chat Component ---
// This is the parent component that combines ConversationList and ChatWindow
const Chat = () => {
    const {
        selectedConversation,
        messages,
        loading,
        error,
        hasMoreMessages,
        fetchMessages,
        addMessageToConversation,
        selectConversation,
    } = useConversation();
    const { user } = useUser();
    const userId = user?._id; // Ensure user is not null/undefined

    // Get current conversation's display name and avatar for the chat header
    const currentChatHeader = useMemo(() => {
        if (!selectedConversation) return { name: "Select a conversation", avatar: "" };

        // Logic to determine chat name and avatar based on conversation type
        // This is a more robust way to handle group vs. 1-on-1 chat display
        if (selectedConversation.participants.length > 2 || selectedConversation.title) {
            // It's a group chat (or has a specific title)
            return {
                name: selectedConversation.title || `Group of ${selectedConversation.participants.length}`,
                avatar: selectedConversation.file_url || selectedConversation.title?.charAt(0) || "G"
            };
        } else {
            // It's likely a 1-on-1 chat
            const otherParticipant = selectedConversation.participants.find(p => String(p._id) !== String(userId));
            return {
                name: otherParticipant?.user_full_name || "Direct Chat",
                avatar: otherParticipant?.user_avatar_url || (otherParticipant?.user_full_name ? otherParticipant.user_full_name.charAt(0) : "D")
            };
        }
    }, [selectedConversation, userId]);


    return (
        <div className="chat-ui-wrapper">
            {/* Conversation List Sidebar */}
            <ConversationList
                onConversationClick={selectConversation} // Directly use selectConversation from context
                selectedConversationId={selectedConversation?._id}
            />

            {/* Main Chat Container */}
            <ChatWindow
                selectedConversation={selectedConversation}
                messages={messages}
                loading={loading}
                error={error}
                hasMoreMessages={hasMoreMessages}
                fetchMessages={fetchMessages}
                addMessageToConversation={addMessageToConversation}
                userId={userId}
                currentChatHeader={currentChatHeader}
            />
        </div>
    );
};

export default Chat;