import React from 'react';
import './Forms.css';

const ChangePasswordForm = () => {
    return (
        <div className="form-container">
            <h2>Change Password</h2>
            <form>
                <input type="password" placeholder="Current Password" required />
                <input type="password" placeholder="New Password" required />
                <input type="password" placeholder="Confirm New Password" required />
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePasswordForm;
