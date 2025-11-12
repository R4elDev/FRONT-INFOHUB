import React from 'react';
import ChatComponent from './ChatComponent';
import { ChatProvider } from '../../contexts/ChatContext';
import '../../styles/chat.css';

interface FloatingChatProps {
  className?: string;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ className = '' }) => {
  return (
    <ChatProvider>
      <div className={`chat-floating ${className}`}>
        <ChatComponent isFloating={true} />
      </div>
    </ChatProvider>
  );
};

export default FloatingChat;
