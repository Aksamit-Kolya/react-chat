import React from "react";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ContextMenu.css";

const ContextMenu = ({ contextMenuPosition, onUpdateMessage, onDeleteMessage }) => {

    return (
      <div className="context-menu" style={{position: "absolute", top: contextMenuPosition.top, left: contextMenuPosition.left }}>
        <button onClickCapture={onUpdateMessage}>
          <FontAwesomeIcon icon={faEdit} className="context-menu-icon" />
          Edit
        </button>
        <button onClickCapture={onDeleteMessage}>
          <FontAwesomeIcon icon={faTrash} className="context-menu-icon" />
          Delete
        </button>
      </div>
    );
};

export default ContextMenu;