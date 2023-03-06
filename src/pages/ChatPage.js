import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";
import ChatService from './ChatService';
import arrowImage from "./arrow.png";

const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const loadMessages = () => {
    setLoading(true);
    // simulate fetching new messages from a server
    setTimeout(() => {
      const newMessages = [
        {        
          id: messages.length + 1,        
          author: "John",        
          text: "Did you see the game last night?",      
        },      
        {        
          id: messages.length + 2,        
          author: user,        
          text: "No, I missed it. Who won?",      
        },      
        {        
          id: messages.length + 3,        
          author: "John",        
          text: "The Lakers. It was a great game!",      
        },    
      ];
      setMessages([...newMessages, ...messages]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    ChatService.findHistory(0, 20).then(response => {
      setMessages(response.data)
    });
  }, [user]);

  useEffect(() => {
    // scroll to the bottom of the message container when new messages are added
    //messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    const messagesContainer = document.querySelector(".messages-container");
    messagesContainer.addEventListener("scroll", () => {
      if (messagesContainer.scrollTop === 0 && !loading) {
        loadMessages();
      }
    });
  }, [messages, loading]);

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    if (newMessage.trim() === '') return;
    const newId = messages.length + 1;
    const newMessageObject = {
      id: newId,
      author: user,
      text: newMessage,
      isUserOwner: true
    };
    ChatService.sendMessage(newMessage).then(response => {
      console.log('TEST: ' + response)
    });
    setMessages([...messages, newMessageObject]);
    setNewMessage("");
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.isUserOwner ? "message user-message" : "message other-message"
            }
          >
            <div className="message-text-container">
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <hr className="divider"/>
      <form onSubmit={handleMessageSubmit} className="message-input-container">
        <input
          type="text"
          placeholder="Send a message"
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
