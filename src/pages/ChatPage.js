import React, { useState } from "react";
import "./ChatPage.css";

function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, author: "John", userId: 1, text: "Hello, how are you?" },
    { id: 2, author: "Mary", userId: 2, text: "I'm doing well, thanks for asking." },
    { id: 3, author: "John", userId: 1, text: "What have you been up to lately?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newMessage = {
      id: messages.length + 1,
      author: "User",
      userId: 0,
      text: inputValue,
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.userId === 0 ? "user-message" : "other-message"
            }`}
          >
            <div className="message-author">{message.author} ({message.userId})</div>
            <div className="message-text-container">
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatPage;