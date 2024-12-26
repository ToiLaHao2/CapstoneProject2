import React, { useState } from "react";
import "./Chat.css";

const Chat = () => {
    const [messages, setMessages] = useState([
        { type: "user", text: "Is this jacket waterproof and warm?" },
        { type: "response", text: "Yes, it’s both waterproof and warm." },
        { type: "user", text: "What kind of insulation does it have?" },
        { type: "response", text: "The jacket is insulated with high-quality down, ensuring excellent warmth even in very cold conditions." },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;

        // Add the user's message to the chat
        setMessages([...messages, { type: "user", text: newMessage }]);
        setNewMessage("");

        // Simulate a bot response after 1 second
        setTimeout(() => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "response", text: "This is a mocked response for testing UI." },
            ]);
        }, 1000);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="user-info">
                    <div className="avatar"></div>
                    <div className="user-details">
                        <h4>Rucas Royal</h4>
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.type === "user" ? "user-message" : "response-message"}`}
                    >
                        <p>{message.text}</p>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Enter a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
