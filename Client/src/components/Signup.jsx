import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/signup", {
        email,
        password,
      });

      if (response.data.success) {
        alert("Signup successful! You can now log in.");
        navigate("/"); // Redirect to login page after successful signup
      } else {
        alert(response.data.message); // Display error message
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup.");
    }
  }

  return (
    <div className="signup">

        <div><h2>Signup</h2>
      <form  className="loginform" onSubmit={handleSubmit}>
        <label className="loginlabel" htmlFor="email">Email</label>
        <input
          type="email" 
          className="inputlabel"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          required
        />
        <label className="loginlabel" htmlFor="password">Password</label>
        <input
          type="password"
          className="inputlabel"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          required
        />
        <label className="loginlabel" htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
           className="inputlabel"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          name="confirmPassword"
          required
        />
        <button className="loginbutton1" type="submit">Signup</button>
      </form></div>
      
    </div>
  );
}

export default Signup;
