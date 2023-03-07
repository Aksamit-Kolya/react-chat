import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";
import ChatService from './ChatService';
import arrowImage from "./arrow.png";

const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [loadingMessagesPageSize, setLoadingMessagesPageSize] = useState(5);
  const [isAllMessagesLoaded, setIsAllMessagesLoaded] = useState(false);
  const prevMessages = usePreviousValue(messages);

  function usePreviousValue(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  

  const loadMessages = () => {
    if(isAllMessagesLoaded) return;
    
    setLoading(true);
    const messagesContainer = document.querySelector(".messages-container");
    
    ChatService.findHistory(Math.floor(messages.length / loadingMessagesPageSize), loadingMessagesPageSize).then((response) => {
      setMessages([...response.data.slice(0, Math.min(loadingMessagesPageSize - messages.length % loadingMessagesPageSize, response.data.length - messages.length % loadingMessagesPageSize)), ...messages]);
      messagesContainer.scrollTop = 43.3 * loadingMessagesPageSize * (loadingMessagesPageSize - messages.length % loadingMessagesPageSize) / loadingMessagesPageSize;
      setLoadingMessagesPageSize(loadingMessagesPageSize + 5);
      
      if(response.data.length < loadingMessagesPageSize) {
        setIsAllMessagesLoaded(true);
      }
      
      setLoading(false);
    });
  };

  useEffect(() => {
    ChatService.findHistory(0, 20).then(response => {
      setMessages(response.data);
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    });
  }, [user]);

  useEffect(() => {
    if(messages.length < 21 || prevMessages[prevMessages.length - 1] !== messages[messages.length - 1]) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    if (newMessage.trim() === '') return;
    const newMessageObject = {
      author: user,
      text: newMessage,
      isUserOwner: true,
      isNewMessage: true
    };
    ChatService.sendMessage(newMessage).then(response => {
      console.log('TEST: ' + response)
    });
    setMessages([...messages, newMessageObject]);
    setNewMessage("");
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
