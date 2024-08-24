import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Login from "./Login";
import CreateArea from "./CreateArea";
import Note from "./Note";
import axios from "axios";
import Signup from "./Signup";
import PrivateRoute from "./PrivateRoute";

const API_BASE_URL = "https://dny-wko4.vercel.app"; // Replace with your actual backend URL

function App() {
  const [notes, setNotes] = useState([]);
  const [email, setEmail] = useState("");
axios.defaults.withCredentials=true;
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (email) {
      fetchNotes(email);
    }
  }, [email]);

  const fetchNotes = (userEmail) => {
    axios.get(`${API_BASE_URL}/notes`, { params: { email: userEmail } })
      .then(response => {
        setNotes(response.data);
      })
      .catch(error => {
        console.error("Error fetching notes:", error);
      });
  };

  function addNote(newNote) {
    if (email) {
      axios.post(`${API_BASE_URL}/notes`, { email, ...newNote })
        .then(() => {
          setNotes(prevNotes => [...prevNotes, newNote]);
        })
        .catch(error => {
          console.error("Error adding note:", error);
        });
    }
  }

  function shareNote(title, content, shareEmail) {
    if (shareEmail) {
      axios.post(`${API_BASE_URL}/notes`, { email: shareEmail, title, content })
        .then(() => {
          alert("Note shared successfully!");
        })
        .catch(error => {
          console.error("Error sharing note:", error);
        });
    }
  }

  function deleteNote(title, content) {
    if (email) {
      axios.delete(`${API_BASE_URL}/notes`, {
        data: { title, content, email }
      })
      .then(() => {
        setNotes(prevNotes => prevNotes.filter(note =>
          (!title || note.title !== title) &&
          (!content || note.content !== content)
        ));
      })
      .catch(error => {
        console.error("Error deleting note:", error);
      });
    }
  }

  function logout() {
    localStorage.removeItem("email");
    setEmail("");
    setNotes([]);
  }

  return (
    <div className="App">
      <Router>
        <Header onLogout={logout} />
        <Routes>
          <Route path="/" element={<Login setEmail={setEmail} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/notes" element={
            <PrivateRoute
              element={
                <div>
                  <CreateArea onAdd={addNote} />
                  {notes.map((note, index) => (
                    <Note
                      key={index}
                      id={index}
                      title={note.title}
                      content={note.content}
                      onDelete={deleteNote}
                      onShare={shareNote}
                    />
                  ))}
                </div>
              }
            />
          } />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
