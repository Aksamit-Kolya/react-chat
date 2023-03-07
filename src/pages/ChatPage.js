import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";
import ChatService from './ChatService';
import arrowImage from "./arrow.png";

const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const [loadingMessagesPageSize, setLoadingMessagesPageSize] = useState(5);
  const [isAllMessagesLoaded, setIsAllMessagesLoaded] = useState(false);

  const loadMessages = () => {
    if(isAllMessagesLoaded) return;
    setLoading(true);
    const messagesContainer = document.querySelector(".messages-container");
    ChatService.findHistory(Math.floor(messages.length / loadingMessagesPageSize), loadingMessagesPageSize).then((response) => {
      if(response.data.length !== 0) {
        setMessages([...response.data.slice(messages.length % loadingMessagesPageSize), ...messages]);
        messagesContainer.scrollTop = 43.3 * loadingMessagesPageSize * (loadingMessagesPageSize - messages.length % loadingMessagesPageSize) / loadingMessagesPageSize;
        setLoadingMessagesPageSize(loadingMessagesPageSize + 5);
      } else {
        setIsAllMessagesLoaded(true);
      }
      setLoading(false);
    }).catch(() => setIsAllMessagesLoaded(true));
  };

  useEffect(() => {
    if (newMessageCount > 0) {
      const messagesContainer = document.querySelector(".messages-container");
      messagesContainer.classList.add("new-messages");
      setTimeout(() => {
        messagesContainer.classList.remove("new-messages");
        setNewMessageCount(0);
      }, 3000);
    }
  }, [newMessageCount]);

  useEffect(() => {
    ChatService.findHistory(0, 20).then(response => {
      setMessages(response.data);
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    });
  }, [user]);

  useEffect(() => {
    // scroll to the bottom of the message container when new messages are added
    if(messages.length < 21) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

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

  const handleMessagesContainerScroll = (event) => {
    event.preventDefault();
    if (event.target.scrollTop === 0 && !loading) {
      loadMessages();
    }
  }

  return (
    <div className="chat-container">
      <div className="messages-container" onScroll={handleMessagesContainerScroll}>
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
          type="textarea"
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
