import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';



export const Sidebar: React.FC = () => {

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h2>Pet Manager</h2>
            </div>
            <ul className="menu">
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                        Lista zwierząt
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/add" className={({ isActive }) => isActive ? 'active' : ''}>
                        Nowe zwierzę
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}>
                        Lista ulubionych
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};
