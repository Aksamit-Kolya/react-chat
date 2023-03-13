  import React, {useEffect, useRef, useState} from "react";
  import "./ChatPage.css";
  import ChatService from './ChatService';
  import * as StompJs from "@stomp/stompjs";
  import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import TextField from '@mui/material/TextField';
  import MessageInput from "../components/MessageInput";


  const ChatPage = ({ user }) => {
    const [messages, setMessages] = useState([]);

    function customSetMessages(messages) {
      for(let i = 0; i < messages.length; ++i) {
        const nextMessage = messages[i + 1];
        const isDifferentOwner = !nextMessage || messages[i].isUserOwner !== nextMessage.isUserOwner; //TODO: Replace with userId
        const isDifferentTime = !nextMessage 
          || new Date(messages[i].dateTime).getHours() !== new Date(nextMessage.dateTime).getHours() 
          || new Date(messages[i].dateTime).getMinutes() !== new Date(nextMessage.dateTime).getMinutes();
        messages[i].shouldDisplayDate = (isDifferentOwner || isDifferentTime);
      }
      setMessages(messages);
    }

    const [receivedMessage, setReceivedMessage] = useState({});
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [loadingMessagesPageSize, setLoadingMessagesPageSize] = useState(5);
    const [isAllMessagesLoaded, setIsAllMessagesLoaded] = useState(false);
    const prevMessages = usePreviousValue(messages);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });
    const [editingMessage, setEditingMessage] = useState(null);

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

      console.log('findHistory(1)');
      ChatService.findHistory(Math.floor(messages.length / loadingMessagesPageSize), loadingMessagesPageSize).then((response) => {
        customSetMessages([...response.data.slice(0, Math.min(loadingMessagesPageSize - messages.length % loadingMessagesPageSize, response.data.length - messages.length % loadingMessagesPageSize)), ...messages]);
        messagesContainer.scrollTop = 43.3 * loadingMessagesPageSize * (loadingMessagesPageSize - messages.length % loadingMessagesPageSize) / loadingMessagesPageSize;
        setLoadingMessagesPageSize(loadingMessagesPageSize + 5);
        
        if(response.data.length < loadingMessagesPageSize) {
          setIsAllMessagesLoaded(true);
        }
        
        setLoading(false);
      });
    };

    useEffect(() => {
      console.log('### Conncet');
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
          if(JSON.parse(response.body).actionType === 'DELETE_MESSAGE') return; // TODO: fix
          const messageDto = JSON.parse(response.body);
          const message = {
            messageId: messageDto.messageId,
            text: messageDto.text,
            dateTime: messageDto.dateTime,
            login: messageDto.login,
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
      console.log('findHistory(2)');
      ChatService.findHistory(0, 20).then(response => {
        
        customSetMessages(response.data.map((element) => {return { ...element, login: element.login }})); ///setMessages(response.data));
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      });
    }, [user]);

    useEffect(() => {
      customSetMessages([...messages, receivedMessage]);
    }, [receivedMessage]);

    useEffect(() => {

      if(messages.length < 21 || prevMessages[prevMessages.length - 1] !== messages[messages.length - 1]) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });


    }, [messages]);

    const handleMessagesContainerScroll = (event) => {
      event.preventDefault();
      setSelectedMessage(null);
      if (event.target.scrollTop === 0 && !loading) {
        loadMessages();
      }
    }


  
    const handleDeleteMessage = () => {
      const updatedMessages = messages.filter((message) => message.messageId !== selectedMessage.messageId);
      ChatService.deleteMessage(selectedMessage.messageId);
      customSetMessages(updatedMessages);
      setSelectedMessage(null);
    };

    const handleUpdateMessage = (event) => {
      event.preventDefault();
      setEditingMessage(selectedMessage);
      // const updatedMessages = messages.filter((message) => message.id !== selectedMessage.id);
      // customSetMessages(updatedMessages);
      // setSelectedMessage(null);
    };

    function calculateContextMenuLeftPosition(leftPosition) {
      const contextMenuWidth = 120; // set the width of the context menu here
      const screenWidth = window.innerWidth;
      if (leftPosition + contextMenuWidth > screenWidth) {
        return leftPosition - contextMenuWidth;
      } else {
        return leftPosition;
      }
    }

    function handleChatContainerClick(event) {
      if(!event.target.closest('.message-box')) {
        setSelectedMessage(null);
      }
      if(!event.target.closest('.edit-message-input')){
        setEditingMessage(null);
      }
    }

    function handleEditFormClick(event) {
      ///event.stopPropagation();
    }

    return (
      <div className="chat-container" onClick={handleChatContainerClick}>
        <div className="messages-container" onScroll={handleMessagesContainerScroll}>
          {
            messages.map((message) => (
              <div
                key={message.messageId}
                className={
                  message.isUserOwner ? 
                    message.shouldDisplayDate ? "message user-message" : "message user-message same-time" :
                    message.shouldDisplayDate ? "message other-message" : "message other-message same-time"
                }
                
              >
                <div className="message-row-container">
                  <div className="message-data-container">
                    <div className="message-box" onClick={(event) => {
                        event.preventDefault();
                        setSelectedMessage(message);
                        setContextMenuPosition({ top: event.pageY, left: calculateContextMenuLeftPosition(event.pageX) });
                      }}>
                      <div className="message-author">{!message.isUserOwner && message.login}</div>
                      <div className="message-text">{message.text}</div>
                    </div>
                    {message.shouldDisplayDate && (
                      <div className="message-date">{new Date(message.dateTime).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', hour12: true}).replace(/^0/, '')}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        {selectedMessage && !editingMessage ? 
          (
            <div className="context-menu" style={{position: "absolute", top: contextMenuPosition.top, left: contextMenuPosition.left }}>
              <button onClickCapture={handleUpdateMessage}>
                <FontAwesomeIcon icon={faEdit} className="context-menu-icon" />
                Edit
              </button>
              <button onClickCapture={handleDeleteMessage}>
                <FontAwesomeIcon icon={faTrash} className="context-menu-icon" />
                Delete
              </button>
            </div>
          )
        :
          editingMessage && (
            <form className="edit-message-form" onClickCapture={handleEditFormClick} onSubmit={handleUpdateMessage} style={{top: contextMenuPosition.top, left: contextMenuPosition.left}}>
              <div id="input" contenteditable data-placeholder="Enter your text"></div>
              <TextField
                className="edit-message-input"
                multiline
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    "& > fieldset": {
                      borderColor: "black",
                      borderWidth: 1
                    }
                  }
                }}
                InputProps={{
                  style: {
                    borderRadius: '5px',
                    margin: '5px',
                    width: '135%',
                    height: '10px',
                    fontSize: '12px',
                  }
                }}
              />
              <div className="edit-message-buttons-container">
                <button type="submit">Edit</button>
                <button type="button" onClick={() => setEditingMessage(null)}>
                  Cancel
                </button>
              </div>
            </form>
          )
        }
        <hr className="divider"/>
        <MessageInput />
      </div>
    );
  };

  export default ChatPage;
