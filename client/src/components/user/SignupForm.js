import React from 'react';
import './Forms.css';

const SignupForm = () => {
    return (
        <div className="form-container">
            <h2>Sign Up</h2>
            <form>
                <input type="text" placeholder="Full Name" required />
                <input type="text" placeholder="Username" required />
                <input type="email" placeholder="Email" required />
                <input type="text" placeholder="Phone Number" required />
                <input type="password" placeholder="Password" required />
                <input type="password" placeholder="Confirm Password" required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignupForm;
