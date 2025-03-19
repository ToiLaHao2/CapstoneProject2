import React from 'react';
import './CardDetail.css';
import { FiCalendar, FiBold, FiUnderline, FiLink, FiImage } from 'react-icons/fi';

function CardDetail() {
  return (
    <div className="card-container">
      <div className="card-header">
        <div className="label label-highest">Highest</div>
        <input type="text" className="input-field" placeholder="Card Title" />
      </div>

      <div className="card-section">
        <div className="section-title">Members</div>
        <div className="member-icons-container">
          <div className="member-icon member-icon-1">M</div>
          <div className="member-icon member-icon-2">M</div>
          <div className="member-icon member-icon-3">M</div>
          <div className="add-member-icon">+</div>
        </div>
      </div>

      <div className="card-section">
        <div className="section-title">Due date:</div>
        <div className="input-field-container">
          <input type="date" className="input-field" placeholder="Select date" />
          <span className="input-icon">
            <FiCalendar />
          </span>
        </div>
      </div>

      <div className="card-section">
        <textarea className="textarea-field" placeholder="Description here...."></textarea>
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
        <button className="button button-primary">Save</button>
        <button className="button button-secondary">Cancel</button>
      </div>
    </div>
  );
}

export default CardDetail;