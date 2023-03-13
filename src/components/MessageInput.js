import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import ChatService from "../pages/ChatService";
import arrowImage from "./arrow.png";
import "./MessageInput.css";

const MessageInput = ({ onMessageSent }) => {
  const [newMessage, setNewMessage] = useState("");
  const [numLines, setNumLines] = useState(1);

  useEffect(() => {
    setNumLines(newMessage.split(/\r\n|\r|\n/).length);
  }, [newMessage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    ChatService.sendMessage(newMessage).then(() => {
      setNewMessage("");
      onMessageSent();
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && newMessage.replace(/[\n\r\s]+/g, '').length > 0) {
        handleSubmit(event);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <TextField
        placeholder="Send a message"
        variant="outlined"
        value={newMessage}
        onChange={(event) => setNewMessage(event.target.value)}
        multiline
        rows={Math.min(numLines, 5)}
        fullWidth
        InputProps={{
          style: {
            borderRadius: 50 / numLines,
            fontSize: "14px",
            padding: "10px",
            paddingLeft: "15px",
            paddingTop: "11px",
            paddingBottom: "9px",
          },
          onKeyDown: handleKeyDown,
        }}
        sx={{
          marginLeft: "30px",
          marginRight: "10px",
          "& .MuiOutlinedInput-root.Mui-focused": {
            "& > fieldset": {
              borderColor: "black",
              borderWidth: 1,
            },
          },
        }}
      />
      <button type="submit" className="send-message-button">
        <img
          src={arrowImage}
          alt="Send"
          className="send-message-button-image"
        />
      </button>
    </form>
  );
};

export default MessageInput;