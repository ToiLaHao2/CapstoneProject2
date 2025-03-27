// import React, { useState } from 'react';
// import './CardDetail.css';

// import { FiCalendar, FiBold, FiUnderline, FiLink, FiImage } from 'react-icons/fi';
// import { useParams, useLocation } from 'react-router-dom';

// function CardDetail() {
//   const { id } = useParams();
//   const location = useLocation();
//   const task = location.state?.task;
//   const initialCardTitle = task?.card_title || '';
//   const [cardTitle, setCardTitle] = useState(initialCardTitle);

//   return (
//     <div className="card-container">
//       <div className="card-header">
//         <div className="label label-highest">Highest</div>
//         <input
//           type="text"
//           className="input-field"
//           placeholder="Card Title"
//           value={cardTitle}
//           onChange={(e) => setCardTitle(e.target.value)}
//         />
//       </div>

//       <div className="card-section">
//         <div className="section-title">Members</div>
//         <div className="member-icons-container">
//           <div className="member-icon member-icon-1">M</div>
//           <div className="member-icon member-icon-2">M</div>
//           <div className="member-icon member-icon-3">M</div>
//           <div className="add-member-icon">+</div>
//         </div>
//       </div>

//       <div className="card-section">
//         <div className="section-title">Due date:</div>
//         <div className="input-field-container">
//           <input type="date" className="input-field" placeholder="Select date" />
//           <span className="input-icon">
//             <FiCalendar />
//           </span>
//         </div>
//       </div>

//       <div className="card-section">
//         <textarea className="textarea-field" placeholder="Description here...."></textarea>
//         <div className="textarea-footer">
//           <div className="textarea-icons">
//             <span className="icon">
//               <FiBold />
//             </span>
//             <span className="icon">
//               <FiUnderline />
//             </span>
//             <span className="icon">
//               <FiLink />
//             </span>
//             <span className="icon">
//               <FiImage />
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="card-actions">
//         <button className="button button-primary">Save</button>
//         <button className="button button-secondary">Cancel</button>
//       </div>
//     </div>
//   );
// }

// export default CardDetail;

import React, { useEffect, useState } from "react";
import "./CardDetail.css";

import {
    FiCalendar,
    FiBold,
    FiUnderline,
    FiLink,
    FiImage,
} from "react-icons/fi";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCard } from "../../../context/CardContext";
import { useBoard } from "../../../context/BoardContext";

function CardDetail() {
    const { taskId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const boardId = location.state?.boardId;
    const listId = location.state?.listId;

    const task = location.state?.task;
    const initialCardTitle = task?.card_title || "";
    const [cardTitle, setCardTitle] = useState(initialCardTitle);

    const initialDescription = task?.card_description || "";

    const initialLabels = task?.card_labels || [];
    const [labels, setLabels] = useState(initialLabels);

    const initialDuration = task?.card_duration
        ? new Date(task.card_duration).toISOString().split("T")[0]
        : "";
    const [duration, setDuration] = useState(initialDuration);

    const initialCompleted = task?.card_completed || false;
    const [completed, setCompleted] = useState(initialCompleted);

    const [priority, setPriority] = useState("high");
    const [members, setMembers] = useState([]);
    const [description, setDescription] = useState(initialDescription);

    const [showAddMemberForm, setShowAddMemberForm] = useState(false);
    const [newMember, setNewMember] = useState("");

    const [memberSuggestions, setMemberSuggestions] = useState([]);

    const { getAllMembers } = useBoard();
    const { assignUserToCard } = useCard();

    const { updateCard } = useCard();
    const { getCard } = useCard();

    // console.log("Task ID:", task?.id);
    // console.log("Board ID:", task?.board_id);
    // console.log("List ID:", listId);

    const handlePriorityChange = (event) => {
        setPriority(event.target.value);
    };

    const handleCompletedChange = (event) => {
        setCompleted(event.target.checked);
        console.log("Completed changed:", event.target.checked);
    };

    const handleSave = async () => {
        try {
            await updateCard(boardId, listId, taskId, {
                card_id: taskId,
                card_title: cardTitle,
                card_description: description,
                card_duration: duration
                    ? new Date(duration).toISOString()
                    : null,
                card_completed: completed,
            });
            navigate(-1);
        } catch (error) {
            console.error("Failed to update card:", error);
        }
    };

    const handleAddMemberIconClick = () => {
        setShowAddMemberForm(true);
    };

    const handleAddMemberFormCancel = () => {
        setShowAddMemberForm(false);
        setNewMember("");
        setMemberSuggestions([]);
    };

    // const handleAddMemberFormAdd = () => {
    //   if (newMember.trim()) {
    //     setMembers([...members, newMember.trim()]);
    //     setShowAddMemberForm(false);
    //     setNewMember('');
    //     setMemberSuggestions([]);
    //   }
    // };

    const handleAddMemberFormAdd = async () => {
        if (newMember.trim()) {
            try {
                const assignedUserData = memberSuggestions.find(
                    (member) => member.user_email === newMember.trim()
                );

                if (assignedUserData) {
                    await assignUserToCard(
                        boardId,
                        listId,
                        taskId,
                        assignedUserData._id
                    );
                    setMembers([...members, assignedUserData.user_email]);
                    setShowAddMemberForm(false);
                    setNewMember("");
                    setMemberSuggestions([]);
                } else {
                    console.error("User not found in suggestions.");
                }
            } catch (error) {
                console.error("Failed to assign user to card:", error);
            }
        }
    };

    // useEffect(() => {
    //   const fetchMembers = async () => {
    //     if (showAddMemberForm) {
    //       try {
    //         const allMembers = await getAllMembers(boardId);
    //         console.log("All members:", allMembers);
    //         if (allMembers && Array.isArray(allMembers)) {
    //           allMembers.forEach(member => console.log("Member:", member));
    //           setMemberSuggestions(allMembers);
    //         } else {
    //           setMemberSuggestions([]);
    //         }
    //       } catch (error) {
    //         console.error("Failed to fetch members:", error);
    //       }
    //     }
    //   };
    //   fetchMembers();
    // }, [showAddMemberForm, getAllMembers, boardId]);

    useEffect(() => {
        const fetchCardDetails = async () => {
            try {
                const cardDetails = await getCard(boardId, listId, taskId);
                console.log("Card Details:", cardDetails);
                if (cardDetails && cardDetails.card_assignees) {
                    const fetchedMembers = cardDetails.card_assignees
                        .map((assignee) => {
                            if (assignee && assignee.user_email) {
                                return assignee;
                            }
                            return null;
                        })
                        .filter((email) => email);
                    setMembers(fetchedMembers);
                    console.log("Members state:", fetchedMembers); // Thêm dòng này
                }
            } catch (error) {
                console.error("Failed to fetch card details:", error);
            }
        };

        fetchCardDetails();

        const fetchMembers = async () => {
            if (showAddMemberForm) {
                try {
                    const allMembers = await getAllMembers(boardId);
                    console.log("All members:", allMembers);
                    if (allMembers && Array.isArray(allMembers)) {
                        allMembers.forEach((member) =>
                            console.log("Member:", member)
                        );
                        setMemberSuggestions(allMembers);
                    } else {
                        setMemberSuggestions([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch members:", error);
                }
            }
        };
        fetchMembers();
    }, [showAddMemberForm, getAllMembers, boardId, taskId]);

    const handleMemberInputChange = (e) => {
        const inputValue = e.target.value;
        setNewMember(inputValue);

        if (inputValue.trim() && memberSuggestions) {
            const filteredSuggestions = memberSuggestions.filter((member) =>
                (member.user_email || "")
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
            );
            setMemberSuggestions(filteredSuggestions);
        } else {
            setMemberSuggestions(memberSuggestions || []);
        }
    };

    const handleMemberSuggestionClick = (member) => {
        setNewMember(member.user_email);
    };

    return (
        <div className="card-container">
            <div className="card-header">
                <select
                    className="priority-select"
                    value={priority}
                    onChange={handlePriorityChange}
                >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <div className="completed-checkbox">
                    <input
                        type="checkbox"
                        id="completed"
                        checked={completed}
                        onChange={handleCompletedChange}
                    />
                    <label htmlFor="completed">Completed</label>
                </div>

                <input
                    type="text"
                    className="input-field"
                    placeholder="Card Title"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                />
            </div>

            <div className="card-section">
                <div className="section-title">Members</div>
                {/* <div className="member-icons-container">
          {members.length > 0 && members.map((member, index) => (
            <div key={index} className={`member-icon member-icon-${index + 1}`}>
              {member.charAt(0).toUpperCase()}
            </div>
          ))}
          <div className="add-member-icon" onClick={handleAddMemberIconClick}>+</div>
        </div> */}

                <div className="member-icons-container">
                    {members.length > 0 &&
                        members.map((member, index) =>
                            member.user_avatar_url !== "empty" ? (
                                <img
                                    className="member-icon-img"
                                    src={member.user_avatar_url}
                                    alt="member-icon"
                                />
                            ) : (
                                <div
                                    key={index}
                                    className={`member-icon member-icon-${
                                        index + 1
                                    }`}
                                >
                                    {member.charAt(0).toUpperCase()}
                                </div>
                            )
                        )}
                    <div
                        className="add-member-icon"
                        onClick={handleAddMemberIconClick}
                    >
                        +
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="section-title">Due date:</div>
                <div className="input-field-container">
                    {/* <input
            type="date"
            className="input-field"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          /> */}

                    <input
                        type="date"
                        className="input-field"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />

                    <span className="input-icon">
                        <FiCalendar />
                    </span>
                </div>
            </div>

            <div className="card-section">
                <textarea
                    className="textarea-field"
                    placeholder="Description here...."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div className="textarea-footer">
                    <div className="textarea-icons">
                        <span className="icon">
                            <FiBold />
                        </span>
                        <span className="icon">
                            <FiUnderline />
                        </span>
                        <span className="icon">
                            <FiLink />
                        </span>
                        <span className="icon">
                            <FiImage />
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button className="button button-primary" onClick={handleSave}>
                    Save
                </button>

                <button className="button button-secondary">Cancel</button>
            </div>

            {showAddMemberForm && (
                <div className="add-member-form-overlay">
                    <div className="add-member-form">
                        <input
                            type="text"
                            placeholder="Search member..."
                            value={newMember}
                            onChange={handleMemberInputChange}
                            className="add-member-input"
                        />
                        <div className="add-member-list">
                            {memberSuggestions.map((member) => (
                                <div
                                    key={member._id}
                                    className="add-member-item"
                                    onClick={() =>
                                        handleMemberSuggestionClick(member)
                                    }
                                >
                                    {member.user_email}{" "}
                                    {/* Display user_email here */}
                                </div>
                            ))}
                        </div>
                        <div className="add-member-actions">
                            <button
                                className="add-member-cancel"
                                onClick={handleAddMemberFormCancel}
                            >
                                CANCEL
                            </button>
                            <button
                                className="add-member-add"
                                onClick={handleAddMemberFormAdd}
                            >
                                ADD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CardDetail;
