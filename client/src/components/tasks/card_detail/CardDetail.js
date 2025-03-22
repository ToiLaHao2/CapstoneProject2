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


import React, { useState } from 'react';
import './CardDetail.css';

import { FiCalendar, FiBold, FiUnderline, FiLink, FiImage } from 'react-icons/fi';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCard } from '../../../context/CardContext';

function CardDetail() {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const boardId = location.state?.boardId;
  const listId = location.state?.listId;

  const task = location.state?.task;
  const initialCardTitle = task?.card_title || '';
  const [cardTitle, setCardTitle] = useState(initialCardTitle);

  const initialDescription = task?.card_description || '';

  const initialLabels = task?.card_labels || [];
  const [labels, setLabels] = useState(initialLabels);

  const initialDuration = task?.card_duration ? new Date(task.card_duration).toISOString().split('T')[0] : '';
  const [duration, setDuration] = useState(initialDuration);

  const initialCompleted = task?.card_completed || false;
  const [completed, setCompleted] = useState(initialCompleted);

  const [priority, setPriority] = useState('high');
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState(initialDescription);
  // const [dueDate, setDueDate] = useState(initialDueDate);

  const { updateCard } = useCard();

  console.log("Task ID:", task?.id);
  console.log("Board ID:", task?.board_id);
  console.log("List ID:", listId);

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleCompletedChange = (event) => {
    setCompleted(event.target.checked);
    console.log("Completed changed:", event.target.checked);
  };

  // const handleSave = async () => {
  //   try {
  //     console.log('Data to update:', {
  //       card_id: taskId,
  //       card_title: cardTitle,
  //       card_description: description,
  //       card_duration: duration ? new Date(duration).toISOString() : null,
  //       card_completed: completed,
  //     });

  //     await updateCard(
  //       boardId,
  //       listId,
  //       taskId,
  //       {
  //         card_id: taskId,
  //         card_title: cardTitle,
  //         card_description: description,
  //         card_duration: duration ? new Date(duration).toISOString() : null,
  //         card_completed: completed,
  //       }
  //     );
  //     navigate(-1);
  //   } catch (error) {
  //     console.error('Failed to update card:', error);
  //   }
  // };

  const handleSave = async () => {
    try {
        await updateCard(
            boardId,
            listId,
            taskId,
            {
                card_id: taskId,
                card_title: cardTitle,
                card_description: description,
                card_duration: duration ? new Date(duration).toISOString() : null,
                card_completed: completed,
            }
        );
        navigate(-1);
    } catch (error) {
        console.error('Failed to update card:', error);
    }
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
        <div className="member-icons-container">
          {members.map((member, index) => (
            <div key={index} className={`member-icon member-icon-${index + 1}`}>
              {member}
            </div>
          ))}
          <div className="add-member-icon">+</div>
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
        {/* <textarea className="textarea-field" placeholder="Description here...."></textarea> */}
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
        {/* <button className="button button-primary">Save</button> */}
        <button className="button button-primary" onClick={handleSave}>Save</button>

        <button className="button button-secondary">Cancel</button>
      </div>
    </div>
  );
}

export default CardDetail;