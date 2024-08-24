import React, { useState } from "react";
import axios from "axios";

function CreateArea(props) {
  const [note, setNote] = useState({
    title: "",
    content: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  let submitNote = async (event) => {
    event.preventDefault(); // Move this up to prevent default form submission behavior

    if (!note.title.trim()) {
      // If title is empty or just whitespace, do not add the note
      alert("Title is required");
      return;
    }
    if (!note.content.trim()) {
      // If title is empty or just whitespace, do not add the note
      alert("content is required");
      return;
    }
    
    props.onAdd(note);
    setNote({
      title: "",
      content: ""
    });

    try {
      await axios.post("http://localhost:3000/notes", note);
      // Optionally, you could also handle the response here if needed
    } catch (error) {
      console.error("Error adding note:", error);
    }
  }
  

  return (
    <div>
      <form>
        <input className="forminput" 
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Title"
          required
          
        />
        <textarea className="forminput" 
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows="3" required
        />
        <button className="formbutton" onClick={submitNote}>Add</button>
      </form>
    </div>
  );
}

export default CreateArea;