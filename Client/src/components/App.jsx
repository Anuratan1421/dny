import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Login from "./login";
import CreateArea from "./CreateArea";
import Note from "./Note";
import axios from "axios";
import Signup from "./Signup";
import PrivateRoute from "./PrivateRoute";
function App() {
  const [notes, setNotes] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      axios.get("http://localhost:3000/notes", {
        params: { email: storedEmail }
      })
        .then(response => {
          setNotes(response.data);
        })
        .catch(error => {
          console.error("Error fetching notes:", error);
        });
    }
  }, [email]);

  function addNote(newNote) {
    if (email) {
      axios.post("http://localhost:3000/notes", { email, ...newNote })
        .then(response => {
          setNotes(prevNotes => [...prevNotes, newNote]);
        })
        .catch(error => {
          console.error("Error adding note:", error);
        });
    }
  }

  function shareNote(title, content, shareEmail) {
    if (shareEmail) {
      axios.post("http://localhost:3000/notes", { email: shareEmail, title, content })
        .then(response => {
          alert("Note shared successfully!"); // Display success alert
          setIsSharing(false);
          setShareEmail(""); // Clear the email input after sharing
        })
        .catch(error => {
          console.error("Error sharing note:", error);
        });
    }
  }

  function deleteNote(title, content) {
    if (email) {
      axios.delete("http://localhost:3000/notes", {
        data: { title, content, email }
      })
        .then(response => {
          setNotes(prevNotes => prevNotes.filter(note =>
            (title && note.title !== title) ||
            (content && note.content !== content)
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
                      onShare={shareNote} // Pass the onShare prop here
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
