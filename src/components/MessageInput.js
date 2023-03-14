import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import ChatService from "../pages/ChatService";
import arrowImage from "./arrow.png";
import "./MessageInput.css";

const MessageInput = ({ onMessageSent, onMessageEdit, onCancelEditing, editingMessage }) => {
  const [messageValue, setMessageValue] = useState(editingMessage ? editingMessage.text : "");
  const [numLines, setNumLines] = useState(1);
  const [isEditingMode, setEditingMode] = useState(false);

  useEffect(() => {
    if(editingMessage) {
      setMessageValue(editingMessage.text);
      setEditingMode(true);
    }
  }, [editingMessage]);

  useEffect(() => {
    setNumLines(messageValue.split(/\r\n|\r|\n/).length);
  }, [messageValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if(!isEditingMode) {
      ChatService.sendMessage(messageValue).then(() => {
        setMessageValue("");
        onMessageSent();
      });
    } else {
      ChatService.editMessage(editingMessage.messageId, messageValue).then(() => {
        setEditingMode(false);
        setMessageValue("");
        onMessageEdit();
      });
    }

  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && messageValue.replace(/[\n\r\s]+/g, '').length > 0) {
        handleSubmit(event);
    }
  };

  return (
    <>
    {isEditingMode && (
      <div className="editing-message-container">
        <div className="editing-message-icon">&#9998;</div>
        <div className="editing-message-text"><strong>Editing</strong> <br></br> {editingMessage?.text}</div>
        <button className="editing-message-cancel-button" onClick={() => {setEditingMode(false) ; setMessageValue(""); onCancelEditing()}}>✕</button>
      </div>
    )}
    <form className="message-input-form" onSubmit={handleSubmit}>
      <TextField
        placeholder="Send a message"
        variant="outlined"
        value={messageValue}
        onChange={(event) => setMessageValue(event.target.value)}
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
    </form></>
  );
};

export default MessageInput;