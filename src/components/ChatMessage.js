import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./ChatMessage.css";

const ChatMessage = ({ message, selected, onMessageClick }) => {
  const handleClick = (event) => {
    event.preventDefault();
    onMessageClick(message, event);
  };

  const formatMessageDate = (date) => {
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(date).toLocaleTimeString(undefined, options).replace(/^0/, '');
  };

  const messageClasses = classNames("message", {
    "user-message": message.isUserOwner,
    "other-message": !message.isUserOwner,
    "same-time": !message.shouldDisplayDate,
    "selected": selected
  });

  return (
    <div className={messageClasses}>
      <div className="message-row-container">
        <div className="message-data-container">
          <div className="message-box" onClick={handleClick}>
            {!message.isUserOwner && (
              <div className="message-author">{message.login}</div>
            )}
            <div className="message-text">{message.text}</div>
          </div>
          {message.shouldDisplayDate && (
            <div className="message-date">
              {formatMessageDate(message.dateTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onMessageClick: PropTypes.func.isRequired,
};

export default ChatMessage;