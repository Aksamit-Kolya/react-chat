  import React, {useEffect, useRef, useState} from "react";
  import "./ChatPage.css";
  import ChatService from './ChatService';
  import * as StompJs from "@stomp/stompjs";

  import MessageInput from "../components/MessageInput";
  import ChatMessage from "../components/ChatMessage";
  import ContextMenu from "../components/ContextMenu";

  const PAGE_SIZE = 30;
  const mockMessages = [
    {
      messageId: 1,
      isUserOwner: true,
      login: "John",
      text: "Hey Sarah!",
      dateTime: new Date(2022, 3, 3, 10, 30),
    },
    {
      messageId: 101,
      isUserOwner: true,
      login: "John",
      text: "It's been a while since we talked. How have you been?",
      dateTime: new Date(2022, 3, 3, 10, 30),
    },
    {
      messageId: 2,
      isUserOwner: false,
      login: "Sarah",
      text: "Hi John!",
      dateTime: new Date(2022, 3, 3, 10, 32),
    },
    {
      messageId: 202,
      isUserOwner: false,
      login: "Sarah",
      text: "Yeah, it has. I've been doing pretty well, thanks for asking",
      dateTime: new Date(2022, 3, 3, 10, 32),
    },
    {
      messageId: 203,
      isUserOwner: false,
      login: "Sarah",
      text: "How about you?",
      dateTime: new Date(2022, 3, 3, 10, 32),
    },
    {
      messageId: 3,
      isUserOwner: true,
      login: "John",
      text: "I'm good too, thanks. So what have you been up to lately?",
      dateTime: new Date(2022, 3, 3, 10, 35),
    },
    {
      messageId: 4,
      isUserOwner: false,
      login: "Sarah",
      text: "Not much, just working and trying to stay active",
      dateTime: new Date(2022, 3, 3, 10, 38),
    },
    {
      messageId: 401,
      isUserOwner: false,
      login: "Sarah",
      text: "I joined a yoga class a few weeks ago and I'm really enjoying it",
      dateTime: new Date(2022, 3, 3, 10, 38),
    },
    {
      messageId: 5,
      isUserOwner: true,
      login: "John",
      text: "That's great!",
      dateTime: new Date(2022, 3, 3, 10, 40),
    },
    {
      messageId: 52,
      isUserOwner: true,
      login: "John",
      text: "I've been trying to get back into running myself",
      dateTime: new Date(2022, 3, 3, 10, 40),
    },
    {
      messageId: 53,
      isUserOwner: true,
      login: "John",
      text: "It's been tough to find the time though",
      dateTime: new Date(2022, 3, 3, 10, 40),
    },
    {
      messageId: 6,
      isUserOwner: false,
      login: "Sarah",
      text: "Yeah, I know what you mean. It can be hard to balance everything",
      dateTime: new Date(2022, 3, 3, 10, 45),
    },
    {
      messageId: 7,
      isUserOwner: true,
      login: "John",
      text: "That's awesome",
      dateTime: new Date(2022, 3, 3, 10, 50),
    },
    {
      messageId: 71,
      isUserOwner: true,
      login: "John",
      text: "I've heard yoga is great for that",
      dateTime: new Date(2022, 3, 3, 10, 50),
    },
    {
      messageId: 8,
      isUserOwner: false,
      login: "Sarah",
      text: "You should! It's been really helpful for me. Plus, the instructor at my class is amazing. She's so knowledgeable and always has great tips and insights.",
      dateTime: new Date(2022, 3, 3, 10, 52),
    },
    {
      messageId: 9,
      isUserOwner: true,
      login: "John",
      text: "That's awesome. Do you have any other tips or recommendations for me?",
      dateTime: new Date(2022, 3, 3, 10, 55),
    },
    {
      messageId: 10,
      isUserOwner: false,
      login: "Sarah",
      text: "Hmm, let me think. Well, I've also been trying to eat healthier lately. I've been cooking more at home and trying to incorporate more fruits and vegetables into my diet.",
      dateTime: new Date(2022, 3, 3, 10, 58),
    },
  ];

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
      customSetMessages([...mockMessages, ...messages]);
      setLoading(false);
      // ChatService.findHistory(messages.length / PAGE_SIZE, PAGE_SIZE).then((response) => {
      //   customSetMessages([...response.data.slice(0, PAGE_SIZE - messages.length % PAGE_SIZE), ...messages]);
      //   if(response.data.length < PAGE_SIZE) {
      //     setIsAllMessagesLoaded(true);
      //   }
      //   setLoading(false);
      // });
    };

    


    useEffect(() => {
      //ChatService.findHistory(0, PAGE_SIZE).then(response => {
        customSetMessages(mockMessages);
      //});
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
        <div className="chat-title">The Best Party</div>
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
          onMessageSent={(newMessage) => customSetMessages([...messages, {
            messageId: 123,
            isUserOwner: true,
            login: "John",
            text: newMessage,
            dateTime: new Date(),
          }])}
        />
      </div>
    );
  };

  export default ChatPage;
