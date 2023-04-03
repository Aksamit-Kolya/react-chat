  import React, {useEffect, useRef, useState} from "react";
  import "./ChatPage.css";
  import ChatService from './ChatService';
  import * as StompJs from "@stomp/stompjs";

  import MessageInput from "../components/MessageInput";
  import ChatMessage from "../components/ChatMessage";
  import ContextMenu from "../components/ContextMenu";

  const PAGE_SIZE = 30;

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

    const [remoteChatEvent, setRemoteChatEvent] = useState({});
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isAllMessagesLoaded, setIsAllMessagesLoaded] = useState(false);
    const prevMessages = usePreviousValue(messages);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });
    const [editingMessage, setEditingMessage] = useState(null);
    const messageInputRef = useRef(null);
    const [oldScrollHeight, setOldScrollHeight] = useState(0);

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
      setOldScrollHeight(messagesContainer.scrollHeight);
      ChatService.findHistory(messages.length / PAGE_SIZE, PAGE_SIZE).then((response) => {
        customSetMessages([...response.data.slice(0, PAGE_SIZE - messages.length % PAGE_SIZE), ...messages]);
        if(response.data.length < PAGE_SIZE) {
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
          setRemoteChatEvent(JSON.parse(response.body));
        }, {"Authorization": 'Bearer ' + localStorage.getItem("accessToken")});
      }

      client.onStompError = (frame) => {
        console.error(frame.headers['message']);
        console.error('Details:', frame.body);
      };
      client.activate();
    }, [])
    


    useEffect(() => {
      ChatService.findHistory(0, PAGE_SIZE).then(response => {
        customSetMessages(response.data.map((element) => {return { ...element, login: element.login }}));
      });
    }, [user]);

    useEffect(() => {
      
      switch (remoteChatEvent.actionType) {
        case "ADD_MESSAGE":

          const messageDto = remoteChatEvent;
          const newMessage = {
            messageId: messageDto.messageId,
            text: messageDto.text,
            dateTime: messageDto.dateTime,
            login: messageDto.login,
            isUserOwner: messageDto.isUserOwner,
            userId: messageDto.userId}
          customSetMessages([...messages, newMessage]);

          break;
        case "UPDATE_MESSAGE":
          customSetMessages(messages.map(el => {
            if(el.messageId !== remoteChatEvent.messageId) return el;
            else {
              el.text = remoteChatEvent.text;
              el.isEdit = true;
              return el;
            } 
          }));
          break;
        case "DELETE_MESSAGE":
          const messageId = remoteChatEvent.messageId;
          customSetMessages(messages.filter(el => el.messageId !== messageId));
          break;
        default:
          break;
      }
      
    }, [remoteChatEvent]);

    useEffect(() => {
      const messagesContainer = document.querySelector(".messages-container");
      if(messagesContainer.scrollTop === 0) messagesContainer.scrollTop = messagesContainer.scrollHeight - oldScrollHeight;

      if(!prevMessages || prevMessages[prevMessages?.length - 1] !== messages[messages.length - 1]) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

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
      messageInputRef.current.setEditingMessage(selectedMessage);
    };

    function calculateContextMenuLeftPosition(leftPosition) {
      const contextMenuWidth = 120;
      const screenWidth = window.innerWidth;
      if (leftPosition + contextMenuWidth > screenWidth) {
        return leftPosition - contextMenuWidth;
      } else {
        return leftPosition;
      }
    }

    function handleChatContainerClick(event) {
      if(!event.target.closest('.user-message .message-box')) {
        setSelectedMessage(null);
      }
    }

    return (
      <div className="chat-container" onClick={handleChatContainerClick}>
        <div className="chat-title">THE BEST PARTY</div>
        <div className="messages-container" onScroll={handleMessagesContainerScroll}>
          {
            messages.map((message) => (
              <ChatMessage
                id={message.messageId}
                key={message.messageId}
                message={message}
                selected={message === selectedMessage}
                onMessageClick={(message, event) => {
                  event.preventDefault();
                  if(message.isUserOwner) {
                    setSelectedMessage(message);
                    setContextMenuPosition({ top: event.pageY, left: calculateContextMenuLeftPosition(event.pageX) });
                  }
                }}
              />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        {selectedMessage &&  
          (
            <ContextMenu 
              contextMenuPosition={contextMenuPosition}
              onUpdateMessage={handleUpdateMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          )
        }
        <hr className="divider"/>
        <MessageInput 
          ref={messageInputRef}
          editingMessage={editingMessage}
          onCancelEditing={() => setEditingMessage(null)}
          onMessageEdit={() => setEditingMessage(null)}
        />
      </div>
    );
  };

  export default ChatPage;
