import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChatResponse,
  fetchChatMessages,
  sendChatMessage,
  Message,
} from "../api";
import { socket } from "../socket";

function Chat(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const chatData = location.state?.chatData as ChatResponse | undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!chatData?.chatId) {
      setError("No chat ID available");
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedMessages = await fetchChatMessages(chatData.chatId);
        setMessages(fetchedMessages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatData?.chatId]);

  useEffect(() => {
    if (!chatData?.chatId || !chatData?.customerId) {
      return;
    }

    const handleConnect = () => {
      socket.emit("join_chat", {
        chatId: chatData.chatId,
        userType: "customer",
        userId: chatData.customerId,
      });
    };

    // Join immediately if already connected, or wait for connection
    if (socket.connected) {
      socket.emit("join_chat", {
        chatId: chatData.chatId,
        userType: "customer",
        userId: chatData.customerId,
      });
    } else {
      socket.on("connect", handleConnect);
    }

    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatData.chatId) {
        // Only add message if it doesn't already exist (prevent duplicates from REST + socket)
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
    };
  }, [chatData?.chatId, chatData?.customerId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !chatData?.chatId || isSending) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const newMessage = await sendChatMessage(chatData.chatId, {
        senderType: "customer",
        senderId: chatData.customerId,
        content: messageInput.trim(),
      });

      // Message will be added via socket event, but add optimistically for immediate UI feedback
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });
      setMessageInput("");
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!chatData) {
    return (
      <div className="chat-container">
        <div className="error-message">No chat data available</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button
          onClick={() => navigate("/")}
          className="back-button"
          type="button"
        >
          ← Back to Login
        </button>
        <h1>Chat</h1>
        <div className="chat-meta">
          <span>Status: {chatData.status}</span>
        </div>
      </div>

      <div className="messages-container">
        {isLoading && <div className="loading">Loading messages...</div>}
        {error && <div className="error-message">{error}</div>}
        {!isLoading && !error && messages.length === 0 && (
          <div className="empty-state">No messages yet</div>
        )}
        {!isLoading &&
          !error &&
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.senderType === "customer"
                  ? "message-right"
                  : "message-left"
              }`}
            >
              <div className="message-content">{message.content}</div>
            </div>
          ))}
      </div>

      <div className="chat-input-area">
        {sendError && <div className="error-message">{sendError}</div>}
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="send-button"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
