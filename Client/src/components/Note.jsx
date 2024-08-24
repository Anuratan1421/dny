import React, { useState } from "react";

function Note({ title, content, onDelete, onShare }) {
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  function handleDeleteClick() {
    if (!title && content) {
      console.error("Cannot delete a note with both title and content empty");
      return;
    }
    onDelete(title, content); // Call deleteNote with correct parameters
  }

  function handleShareClick() {
    setIsSharing(true);
  }

  function handleShareSubmit() {
    if (shareEmail) {
      onShare(title, content, shareEmail); // Call onShare with title, content, and the provided email
      setIsSharing(false);
      setShareEmail(""); // Clear the email input after sharing
    }
  }

  return (
    <div className="note">
      <div className="para">
        <h1>{title}</h1>
        <p>{content}</p>
      </div>
      <button className="notebutton" onClick={handleDeleteClick}>
        DELETE
      </button>
      <button className="notebutton" onClick={handleShareClick}>
        SHARE
      </button>
      {isSharing && (
        <div>
          <input
            type="email" className="inputlabel"
            placeholder="Enter email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <button className="notebutton" onClick={handleShareSubmit}>Share Note</button>
        </div>
      )}
    </div>
  );
}

export default Note;
