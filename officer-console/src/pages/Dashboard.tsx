import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AssignedChats from "../components/AssignedChats";
import GlobalQueue from "../components/GlobalQueue";
import ChatMessages from "../components/ChatMessages";
import { fetchAssignedChats, fetchUnassignedChats, Chat } from "../api";
import { socket } from "../socket";

function Dashboard(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const officerId = location.state?.officerId as string | undefined;
  const [assignedChats, setAssignedChats] = useState<Chat[]>([]);
  const [unassignedChats, setUnassignedChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officerId) {
      setError("No officer ID available");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [assigned, unassigned] = await Promise.all([
          fetchAssignedChats(officerId),
          fetchUnassignedChats(),
        ]);
        setAssignedChats(assigned);
        setUnassignedChats(unassigned);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [officerId]);

  useEffect(() => {
    if (!officerId) {
      return;
    }

    const handleConnect = () => {
      socket.emit("join_officers", { officerId });
    };

    // Join immediately if already connected, or wait for connection
    if (socket.connected) {
      socket.emit("join_officers", { officerId });
    } else {
      socket.on("connect", handleConnect);
    }

    const handleQueueChatCreated = (chat: Chat) => {
      setUnassignedChats((prev) => [...prev, chat]);
    };

    const handleQueueChatClaimed = (data: {
      chatId: string;
      officerId: string;
    }) => {
      setUnassignedChats((prev) =>
        prev.filter((chat) => chat.id !== data.chatId)
      );
      // If claimed by this officer, REST response already updated state
      // No refetch needed - REST is source of truth
    };

    const handleNewMessage = (message: any) => {
      if (selectedChatId === message.chatId) {
        // Message view will handle this via its own socket listener
        // Or we could update messages state here if needed
      }
    };

    socket.on("queue_chat_created", handleQueueChatCreated);
    socket.on("queue_chat_claimed", handleQueueChatClaimed);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("queue_chat_created", handleQueueChatCreated);
      socket.off("queue_chat_claimed", handleQueueChatClaimed);
      socket.off("new_message", handleNewMessage);
    };
  }, [officerId, selectedChatId]);

  const handleChatClaimed = (claimedChat: Chat) => {
    setUnassignedChats((prev) =>
      prev.filter((chat) => chat.id !== claimedChat.id)
    );
    setAssignedChats((prev) => [...prev, claimedChat]);
  };

  if (!officerId) {
    return (
      <div className="dashboard-container">
        <div className="error-message">No officer ID available</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button
          onClick={() => navigate("/")}
          className="back-button"
          type="button"
        >
          ← Back to Login
        </button>
        <h1>Officer Dashboard</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading">Loading...</div>}
      {!isLoading && !error && (
        <div className="dashboard-content">
          <div className="dashboard-section">
            <AssignedChats
              chats={assignedChats}
              onSelectChat={setSelectedChatId}
              selectedChatId={selectedChatId}
            />
          </div>
          <div className="dashboard-section">
            <GlobalQueue
              chats={unassignedChats}
              officerId={officerId}
              onChatClaimed={handleChatClaimed}
            />
          </div>
          {selectedChatId && (
            <div className="dashboard-section messages-section">
              <ChatMessages chatId={selectedChatId} officerId={officerId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
