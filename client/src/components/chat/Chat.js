// import React, { useState } from "react";
// import "./Chat.css";

// const Chat = () => {
//     const [messages, setMessages] = useState([
//         { type: "user", text: "Is this jacket waterproof and warm?" },
//         { type: "response", text: "Yes, it’s both waterproof and warm." },
//         { type: "user", text: "What kind of insulation does it have?" },
//         { type: "response", text: "The jacket is insulated with high-quality down, ensuring excellent warmth even in very cold conditions." },
//     ]);
//     const [newMessage, setNewMessage] = useState("");

//     const handleSendMessage = () => {
//         if (newMessage.trim() === "") return;

//         // Add the user's message to the chat
//         setMessages([...messages, { type: "user", text: newMessage }]);
//         setNewMessage("");

//         // Simulate a bot response after 1 second
//         setTimeout(() => {
//             setMessages((prevMessages) => [
//                 ...prevMessages,
//                 { type: "response", text: "This is a mocked response for testing UI." },
//             ]);
//         }, 1000);
//     };

//     return (
//         <div className="chat-container">
//             <div className="chat-header">
//                 <div className="user-info">
//                     <div className="avatar"></div>
//                     <div className="user-details">
//                         <h4>Rucas Royal</h4>
//                     </div>
//                 </div>
//             </div>

//             <div className="chat-messages">
//                 {messages.map((message, index) => (
//                     <div
//                         key={index}
//                         className={`message ${message.type === "user" ? "user-message" : "response-message"}`}
//                     >
//                         <p>{message.text}</p>
//                     </div>
//                 ))}
//             </div>

//             <div className="chat-input">
//                 <input
//                     type="text"
//                     placeholder="Enter a message"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                 />
//                 <button onClick={handleSendMessage}>Send</button>
//             </div>
//         </div>
//     );
// };

// export default Chat;


import React, { useState } from "react";
import "./Chat.css";

const Chat = () => {
    const [messages, setMessages] = useState([
        { type: "user", text: "Is this all my tasks?" },
        { type: "response", text: "Yes, it’s both due to tomorrow." },
        { type: "user", text: "What kind of insulation does it have?" },
        { type: "response", text: "The task is so difficult if i done by myself." },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;

        setMessages([...messages, { type: "user", text: newMessage }]);
        setNewMessage("");

        setTimeout(() => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "response", text: "Hi, I will reply later" },
            ]);
        }, 1000);
    };

    return (
        <div className="chat-ui">
            <CustomerMessageList />
            <div className="chat-container">
                <div className="chat-header">
                    <div className="user-info">
                        <div className="avatar"></div>
                        <div className="user-details">
                            <h4>Team Project</h4>
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
        </div>
    );
};

const CustomerMessageList = () => {
    const customers = [
        { name: "Group Financial", message: "Do you have any new tasks?", time: "01:08 pm", avatar: "", unread: true },
        { name: "Capstone", message: "I need a new version of this previous task.", time: "06:32 pm", avatar: "", unread: true },
        { name: "Software Planning", message: "I’m attending a github", time: "08:20 pm", avatar: "", unread: true },
        { name: "New Plan", message: "What are your best-selling accessories?", time: "10:32 pm", avatar: "", unread: true },
        { name: "Kathryn Murphy", message: "I’m looking for a new collaborary.", time: "04:15 am", avatar: "", unread: true },
        // Add more customer data as needed
    ];

    return (
        <div className="customer-message-list">
            <div className="header">
                <h3>Message</h3>
                <div className="search-bar">
                    <input type="text" placeholder="Search" />
                    <button>
                        <i className="fa fa-search"></i>
                    </button>
                </div>
            </div>
            <div className="customer-list">
                {customers.map((customer, index) => (
                    <div className="customer-card" key={index}>
                        <div className="avatar">{customer.avatar || "A"}</div>
                        <div className="customer-details">
                            <h4>{customer.name}</h4>
                            <p>{customer.message}</p>
                        </div>
                        <div className="time">
                            <span>{customer.time}</span>
                            {customer.unread && <span className="unread-indicator"></span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;
