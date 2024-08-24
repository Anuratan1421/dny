import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login({ setEmail }) {
  const [email, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    axios.post("http://localhost:3000/", { email, password })
      .then(response => {
        if (response.data.success) {
          setEmail(email);
          localStorage.setItem("email", email); // Store email in localStorage
          navigate("/notes"); // Redirect to /notes
        } else {
          alert(response.data.message);
        }
      })
      .catch(error => {
        console.error("Error during login:", error);
      });
  }

  return (
    <div className="login">
        <div><img className="loginimg" src="https://img.freepik.com/free-vector/hand-drawn-essay-illustration_23-2150287898.jpg?ga=GA1.1.1673030288.1722271388&semt=ais_hybrid" alt="" /></div>
        <div> 

        <form className="loginform" onSubmit={handleSubmit}>
  <div>
    <label  className="loginlabel" htmlFor="email">Email:</label>
    <input  className="inputlabel"
      id="email"
      type="email"
      value={email}
      onChange={e => setEmailInput(e.target.value)}
      placeholder="Enter your Email here"
      required
    />
  </div>
  <div>
    <label className="loginlabel" htmlFor="password">Password:</label>
    <input  className="inputlabel"
      id="password"
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      placeholder="Enter Password here"
      required
    />
  </div>
  <button className="loginbutton1" type="submit">Login</button>
  <p className="signup">
         <Link to="/signup">Sign up here</Link>
      </p>
</form> 



        </div>
      

     
    </div>
  );
}

export default Login;
