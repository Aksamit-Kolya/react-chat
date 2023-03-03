import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";
import arrowImage from "./arrow.png";

const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // simulate fetching messages from a server
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          author: "John",
          text: "Hello!",
        },
        {
          id: 2,
          author: user,
          text: "Hi there!",
        },
        {
          id: 3,
          author: "John",
          text: "How are you doing?",
        },
      ]);
    }, 1000);
  }, [user]);

  useEffect(() => {
    // scroll to the bottom of the message container when new messages are added
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const newId = messages.length + 1;
    const newMessageObject = {
      id: newId,
      author: user,
      text: newMessage,
    };
    setMessages([...messages, newMessageObject]);
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.author === user ? "message user-message" : "message other-message"
            }
          >
            <div className="message-text-container">
              <div className="message-author">{message.author}</div>
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleMessageSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          className="message-input"
        />
        <button type="submit" className="send-button">
          <img src={arrowImage} alt="Send" className="send-button-image" />
        </button>
      </form>
    </div>
  );
};

export default ChatPage;