import { useState, useEffect } from "react";
import { fetchChatMessages, sendChatMessage, Message } from "../api";
import { socket } from "../socket";

interface ChatMessagesProps {
  chatId: string;
  officerId: string;
}

function ChatMessages({ chatId, officerId }: ChatMessagesProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedMessages = await fetchChatMessages(chatId);
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
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !officerId) {
      return;
    }

    const handleConnect = () => {
      socket.emit("join_chat", {
        chatId: chatId,
        userType: "officer",
        userId: officerId,
      });
    };

    // Join immediately if already connected, or wait for connection
    if (socket.connected) {
      socket.emit("join_chat", {
        chatId: chatId,
        userType: "officer",
        userId: officerId,
      });
    } else {
      socket.on("connect", handleConnect);
    }

    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
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
  }, [chatId, officerId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !chatId || isSending) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const newMessage = await sendChatMessage(chatId, {
        senderType: "officer",
        senderId: officerId,
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

  return (
    <div className="chat-messages">
      <h2>Messages</h2>
      {isLoading && <div className="loading">Loading messages...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && messages.length === 0 && (
        <div className="empty-state">No messages yet</div>
      )}
      {!isLoading && !error && (
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.senderType === "customer"
                  ? "message-left"
                  : "message-right"
              }`}
            >
              <div className="message-content">{message.content}</div>
            </div>
          ))}
        </div>
      )}
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

export default ChatMessages;
