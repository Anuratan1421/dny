import React from "react";
import { useNavigate } from "react-router-dom";

function Header({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header>
      <h1>dny Keeper App</h1>
      <button className="logout" onClick={handleLogout}>Logout</button>
    </header>
  );
}

export default Header;
