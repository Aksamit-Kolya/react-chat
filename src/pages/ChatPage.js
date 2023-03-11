  import React, {useEffect, useRef, useState} from "react";
  import "./ChatPage.css";
  import ChatService from './ChatService';
  import arrowImage from "./arrow.png";
  import * as StompJs from "@stomp/stompjs";

  const ChatPage = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [receivedMessage, setReceivedMessage] = useState({});
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
      const client = new StompJs.Client({
        brokerURL: "ws://localhost:8080/actions",
        debug: function (str) {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {

        client.subscribe('/user/async/api/action', (response) => {
          const messageDto = JSON.parse(response.body);
          const message = {
            messageId: messageDto.messageId,
            text: messageDto.text,
            isUserOwner: messageDto.isUserOwner,
            userId: messageDto.userId}
          setReceivedMessage(message);
        }, {"Authorization": 'Bearer ' + localStorage.getItem("accessToken")});
      }

      client.onStompError = (frame) => {
        console.error(frame.headers['message']);
        console.error('Details:', frame.body);
      };
      client.activate();
    }, [])
    


    useEffect(() => {
      ChatService.findHistory(0, 20).then(response => {
        setMessages(response.data);
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      });
    }, [user]);

    useEffect(() => {
      setMessages([...messages, receivedMessage]);
    }, [receivedMessage]);

    useEffect(() => {
      if(messages.length < 21 || prevMessages[prevMessages.length - 1] !== messages[messages.length - 1]) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleMessageSubmit = (event) => {
      event.preventDefault();
      console.log('1: ' + messages);
      ChatService.sendMessage(newMessage).then(response => {
        console.log('TEST: ' + response)
      });
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
