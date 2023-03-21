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
    "selected": selected,
    "multi-line": message.text.split('\n').length > 1
  });

  return (
    <div className={messageClasses}>
      <div className="message-row-container">
        <div className="message-data-container">
          <div className="message-box" onContextMenu={handleClick}>
            {message.isEdit && message.isUserOwner && (
                <div style={{display: "inline-block", marginRight: "10px", marginLeft: "-6px", fontSize: "14px"}}>
                  &#9998;
                </div>
              )}
            <div style={{display: "inline-block"}}>
              {!message.isUserOwner && (
                <div className="message-author">{message.login}</div>
              )}
              <div className="message-text">
                {message.text.split('\n').map((text, index) => (
                  <React.Fragment key={index}>
                    {text}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
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