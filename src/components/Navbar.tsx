import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  
  const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
  
  // Uncomment if menu functionality is needed
  // const toggleMenu = () => {
  //   setMenuOpen(!menuOpen);
  // };
  
  // const closeMenu = () => {
  //   setMenuOpen(false);
  // };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    window.location.href = '/';
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Sublime Ultimate</Link>
      </div>
      
      <ul className="navbar-menu">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/roster">Roster</Link></li>
        <li><Link to="/campaigns">Campaigns</Link></li>
        <li><Link to="/news">News</Link></li>
        <li><Link to="/recruitment">Join Us</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        
        {isAdmin && (
          <li className="admin-nav-item">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
