import React, { useState, useEffect } from "react";
import "./Chat.css";

const Chat = () => {
    // Initial dummy data for team chats
    const initialTeamChats = {
        "Group Financial": [
            { type: "user", text: "Is this all my tasks?" },
            { type: "response", text: "Yes, it’s both due to tomorrow." },
        ],
        "Capstone": [
            { type: "user", text: "I need a new version of this previous task." },
            { type: "response", text: "Okay, I'll prepare it for you." },
        ],
        "Software Planning": [
            { type: "user", text: "I’m attending a github" },
            { type: "response", text: "Great, let me know if you need anything." },
        ],
        "New Plan": [
            { type: "user", text: "What are your best-selling accessories?" },
            { type: "response", text: "We have various options, I can send you a catalog." },
        ],
        "Kathryn Murphy": [
            { type: "user", text: "I’m looking for a new collaborary." },
            { type: "response", text: "We can discuss some potential partners." },
        ],
    };

    const [teamChats, setTeamChats] = useState(initialTeamChats);
    const [selectedTeam, setSelectedTeam] = useState("Group Financial"); // Default selected team
    const [messages, setMessages] = useState(teamChats[selectedTeam]);
    const [newMessage, setNewMessage] = useState("");

    // Update messages when selectedTeam changes
    useEffect(() => {
        setMessages(teamChats[selectedTeam] || []);
    }, [selectedTeam, teamChats]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;

        const updatedMessages = [...messages, { type: "user", text: newMessage }];
        setMessages(updatedMessages);

        // Update teamChats state with the new message
        setTeamChats(prevTeamChats => ({
            ...prevTeamChats,
            [selectedTeam]: updatedMessages
        }));

        setNewMessage("");

        setTimeout(() => {
            const botResponse = "Hi, I will reply later";
            const messagesWithBotResponse = [
                ...updatedMessages,
                { type: "response", text: botResponse },
            ];
            setMessages(messagesWithBotResponse);
            setTeamChats(prevTeamChats => ({
                ...prevTeamChats,
                [selectedTeam]: messagesWithBotResponse
            }));
        }, 1000);
    };

    const handleTeamClick = (teamName) => {
        setSelectedTeam(teamName);
    };

    return (
        <div className="chat-ui">
            <TeamMessageList teams={Object.keys(teamChats).map(name => {
                // Find initial team data to preserve time and unread status
                const initialTeam = initialTeams.find(t => t.name === name);
                return {
                    name,
                    message: teamChats[name][teamChats[name].length - 1]?.text || "", // Last message
                    time: initialTeam?.time || "",
                    avatar: initialTeam?.avatar || "",
                    unread: initialTeam?.unread || false,
                };
            })} onTeamClick={handleTeamClick} selectedTeam={selectedTeam} />
            <div className="chat-container">
                <div className="chat-header">
                    <div className="user-info">
                        <div className="avatar"></div>
                        <div className="user-details">
                            <h4>{selectedTeam}</h4> {/* Display selected team name */}
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

const initialTeams = [
    { name: "Group Financial", message: "Do you have any new tasks?", time: "01:08 pm", avatar: "", unread: true },
    { name: "Capstone", message: "I need a new version of this previous task.", time: "06:32 pm", avatar: "", unread: true },
    { name: "Software Planning", message: "I’m attending a github", time: "08:20 pm", avatar: "", unread: true },
    { name: "New Plan", message: "What are your best-selling accessories?", time: "10:32 pm", avatar: "", unread: true },
    { name: "Kathryn Murphy", message: "I’m looking for a new collaborary.", time: "04:15 am", avatar: "", unread: true },
];

const TeamMessageList = ({ teams, onTeamClick, selectedTeam }) => {
    return (
        <div className="team-message-list">
            <div className="header">
                <h3>Message</h3>
                <div className="search-bar">
                    <input type="text" placeholder="Search" />
                    <button>
                        <i className="fa fa-search"></i>
                    </button>
                </div>
            </div>
            <div className="team-list">
                {teams.map((team, index) => (
                    <div
                        className={`team-card ${team.name === selectedTeam ? "selected" : ""}`}
                        key={index}
                        onClick={() => onTeamClick(team.name)}
                    >
                        <div className="avatar">{team.avatar || team.name.charAt(0)}</div>
                        <div className="team-details">
                            <h4>{team.name}</h4>
                            <p>{team.message}</p>
                        </div>
                        <div className="time">
                            <span>{team.time}</span>
                            {team.unread && <span className="unread-indicator"></span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;