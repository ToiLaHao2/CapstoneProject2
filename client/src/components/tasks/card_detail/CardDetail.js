import React, { useEffect, useState, useRef } from "react";
import "./CardDetail.css";

import { FiCalendar, FiBold, FiUnderline, FiLink, FiImage, } from "react-icons/fi";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCard } from "../../../context/CardContext";
import { useBoard } from "../../../context/BoardContext";
import { useList } from "../../../context/ListContext";
import { useSocket } from "../../../context/SocketContext";

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

    const [selectedListId, setSelectedListId] = useState(listId);
    const [listsInBoard, setListsInBoard] = useState([]);
    const { getListsInBoard } = useBoard();
    const { moveList } = useBoard();

    const [selectedCardId, setSelectedCardId] = useState(taskId);
    const [cardsInList, setCardsInList] = useState([]);
    const { getCardsInList } = useList();

    const currentListId = location.state?.listId;
    const [targetListId, setTargetListId] = useState(currentListId);

    const { moveCard } = useCard();

    const [openMemberDropdown, setOpenMemberDropdown] = useState(null);
    const memberDropdownRef = useRef(null);
    const { removeUserFromCard } = useCard();
    const [userToRemove, setUserToRemove] = useState(null);

    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [userToRemoveConfirmation, setUserToRemoveConfirmation] = useState(null);

    const { socket, connected } = useSocket();

    // socket here
    useEffect(() => {
        if (!connected) return;
        /* ----------Thêm user vào card---------------*/
        const onAddNewMemberToCard = ({ card_id, list_id, board_id, assignee }) => {
            setMembers([...members, assignee]);
        };

        /* ----------tháo user khỏi card---------------*/
        const onRemoveMemberFromCard = ({ card_id, list_id, board_id, remove_user_id }) => {
            setMembers(
                members.filter((m) => m._id !== remove_user_id)
            );
        };

        socket.on("card:allmember:assign", onAddNewMemberToCard);
        socket.on("card:allmember:remove", onRemoveMemberFromCard);

        return () => {
            socket.off("card:allmember:assign", onAddNewMemberToCard);
            socket.off("card:allmember:remove", onRemoveMemberFromCard);
        }
    }, [connected, socket, members])

    const handleListChange = (event) => {
        setTargetListId(event.target.value);
        console.log("Selected Target List ID:", event.target.value);
    };

    const handleCardChange = (event) => {
        setSelectedCardId(event.target.value);
        console.log("Selected Card ID:", event.target.value);
        // logic
    };

    const handlePriorityChange = (event) => {
        setPriority(event.target.value);
    };

    const handleCompletedChange = (event) => {
        setCompleted(event.target.checked);
        console.log("Completed changed:", event.target.checked);
    };

    const handleCancelClick = () => {
        navigate(-1);
    };

    const handleSave = async () => {
        try {

            const cardUpdateDetails = {
                card_id: taskId,
                card_title: cardTitle,
                card_description: description,
                card_duration: duration ? new Date(duration).toISOString() : null,
                card_completed: completed,
                list_id: currentListId,
                card_priority: priority,
            };

            await updateCard(boardId, currentListId, taskId, cardUpdateDetails);

            if (targetListId !== currentListId) {
                const moved = await moveCard(boardId, currentListId, targetListId, taskId);
                if (moved) {
                    console.log(`Card ${taskId} moved to list ${targetListId}`);
                    navigate(-1);
                    return;
                } else {
                    console.error(`Failed to move card ${taskId} to list ${targetListId}`);
                }
            }
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

    //mei
    const handleMemberIconClick = (memberId) => {
        setOpenMemberDropdown((prevOpenMemberDropdown) =>
            prevOpenMemberDropdown === memberId ? null : memberId
        );
    };

    const handleRemoveMemberClick = (member) => {
        setUserToRemoveConfirmation(member);
        setShowRemoveConfirmation(true);
        setOpenMemberDropdown(null);
    };

    const handleConfirmRemove = async () => {
        if (userToRemoveConfirmation) {
            try {
                const removed = await removeUserFromCard(
                    boardId,
                    listId,
                    taskId,
                    userToRemoveConfirmation._id
                );
                if (removed) {
                    setMembers(
                        members.filter((m) => m._id !== userToRemoveConfirmation._id)
                    );
                } else {
                    console.error(
                        `Failed to remove user ${userToRemoveConfirmation.user_email}`
                    );
                }
            } catch (error) {
                console.error("Error removing user:", error);
            } finally {
                setShowRemoveConfirmation(false);
                setUserToRemoveConfirmation(null);
            }
        }
    };

    const handleCancelRemove = () => {
        setShowRemoveConfirmation(false);
        setUserToRemoveConfirmation(null);
    };
    //mei

    useEffect(() => {
        const fetchCardDetails = async () => {
            try {
                const cardDetails = await getCard(boardId, listId, taskId);
                console.log("Card Details:", cardDetails);
                if (cardDetails) {
                    setCardTitle(cardDetails.card_title || "");
                    setDescription(cardDetails.card_description || "");
                    setDuration(
                        cardDetails.card_duration
                            ? new Date(cardDetails.card_duration).toISOString().split("T")[0]
                            : ""
                    );
                    setCompleted(cardDetails.card_completed || false);
                    setPriority(cardDetails.card_priority || "high");
                    if (cardDetails.card_assignees) {
                        setMembers(cardDetails.card_assignees);
                        console.log("Members state:", cardDetails.card_assignees);
                    }
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
                        allMembers.forEach((member) => console.log("Member:", member));
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
    }, [showAddMemberForm, getAllMembers, boardId, taskId, getCard, listId]);

    useEffect(() => {
        const fetchLists = async () => {
            if (boardId) {
                const lists = await getListsInBoard(boardId);
                if (lists) {
                    setListsInBoard(lists);
                    console.log("Lists in board:", lists);
                }
            }
        };
        fetchLists();
    }, [boardId, getListsInBoard, currentListId]);

    useEffect(() => {
        const fetchCardsForCurrentList = async () => {
            if (boardId && listId) {
                const cards = await getCardsInList(boardId, listId);
                if (cards) {
                    setCardsInList(cards);
                    console.log("Cards in list:", cards);
                }
            }
        };

        fetchCardsForCurrentList();
    }, [boardId, listId, getCardsInList]);

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

    console.log("member ", members);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
                setOpenMemberDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [memberDropdownRef]);

    return (
        <div className="card-container">
            <div className="card-header">
                <select
                    className="priority-select"
                    value={priority}
                    onChange={handlePriorityChange}
                >
                    <option value="HIGHEST">HIGHEST</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                </select>

                {/* <div className="completed-checkbox">
                    <input
                        type="checkbox"
                        id="completed"
                        checked={completed}
                        onChange={handleCompletedChange}
                    />
                    <label htmlFor="completed">Completed</label>
                </div> */}

                <input
                    type="text"
                    className="input-field"
                    placeholder="Card Title"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                />
            </div>

            {/* List Selection */}
            <div className="card-section">
                <label htmlFor="list-select" className="section-title">List</label>
                <select
                    id="list-select"
                    className="input-field"
                    value={targetListId || currentListId || ''}
                    onChange={handleListChange}
                >
                    <option value="">Select A List</option>
                    {listsInBoard.map(list => (
                        <option key={list._id} value={list._id}>{list.list_title}</option>
                    ))}
                </select>
            </div>

            {/* Card Selection */}
            <div className="card-section">
                <label htmlFor="card-select" className="section-title">Card</label>
                <select
                    id="card-select"
                    className="input-field"
                    value={selectedCardId || ''}
                    onChange={handleCardChange}
                >
                    <option value="">Select A Card</option>
                    {cardsInList.map(card => (
                        <option key={card._id} value={card._id}>{card.card_title}</option>
                    ))}
                </select>
            </div>

            <div className="card-section">
                <div className="section-title">Members</div>
                <div className="member-icons-container">
                    {members.length > 0 &&
                        members.map((member, index) => (
                            <div key={member._id} className="member-icon-wrapper" ref={openMemberDropdown === member._id ? memberDropdownRef : null}>
                                {member.user_avatar_url !== "empty" ? (
                                    <img
                                        className="member-icon-img"
                                        src={member.user_avatar_url}
                                        alt="member-icon"
                                        onClick={() => handleMemberIconClick(member._id)}
                                    />
                                ) : (
                                    <div
                                        className={`member-icon member-icon-${index + 1}`}
                                        onClick={() => handleMemberIconClick(member._id)}
                                    >
                                        {member.user_full_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                {openMemberDropdown === member._id && (
                                    <div className="member-dropdown">
                                        <div className="member-info">
                                            <b>{member.user_full_name}</b>  <i>({member.user_email})</i>
                                        </div>
                                        <div
                                            className="dropdown-item"
                                            onClick={() => handleRemoveMemberClick(member)}
                                        >
                                            Remove from card
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    <div
                        className="add-member-icon"
                        onClick={handleAddMemberIconClick}
                    >
                        +
                    </div>
                </div>
            </div>

            {showRemoveConfirmation && userToRemoveConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <p>Are you sure you want to remove {userToRemoveConfirmation.user_full_name} from this card?</p>
                        <div className="confirmation-buttons">
                            <button onClick={handleConfirmRemove} className="button button-primary">
                                Yes, Remove
                            </button>
                            <button onClick={handleCancelRemove} className="button button-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card-section">
                <div className="section-title">Due date:</div>
                <div className="input-field-container">
                    <input
                        type="date"
                        className="input-field"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />

                    {/* <span className="input-icon">
                        <FiCalendar />
                    </span> */}
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

                <button className="button button-secondary" onClick={handleCancelClick}>Cancel</button>
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