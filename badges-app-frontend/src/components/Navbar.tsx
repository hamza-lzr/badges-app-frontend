import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css';

const Navbar: React.FC = () => {
    const [open, setOpen] = useState(true);

    return (
        <nav className={`navbar${open ? '' : ' navbar-closed'}`}>
            <button
                className="navbar-toggle"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={open ? 'Close navbar' : 'Open navbar'}
            >
                {open ? '⟨' : '⟩'}
            </button>
            {open && (
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    {/* Add more links as needed */}
                </ul>
            )}
        </nav>
    );
};

export default Navbar;