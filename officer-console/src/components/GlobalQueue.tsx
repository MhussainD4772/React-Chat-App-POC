import { useState } from "react";
import { Chat, claimChat } from "../api";

interface GlobalQueueProps {
  chats: Chat[];
  officerId: string;
  onChatClaimed: (chat: Chat) => void;
}

function GlobalQueue({
  chats,
  officerId,
  onChatClaimed,
}: GlobalQueueProps): JSX.Element {
  const [claimingChatId, setClaimingChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async (chatId: string) => {
    if (!chatId) {
      setError("Chat ID is missing");
      return;
    }
    if (!officerId) {
      setError("Officer ID is missing");
      return;
    }

    setClaimingChatId(chatId);
    setError(null);

    try {
      const claimedChat = await claimChat(chatId, officerId);
      onChatClaimed(claimedChat);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to claim chat";
      setError(errorMessage);
    } finally {
      setClaimingChatId(null);
    }
  };

  return (
    <div>
      <h2>Global Queue</h2>
      {error && <div className="error-message">{error}</div>}
      {chats.length === 0 ? (
        <div className="empty-state">No unassigned chats</div>
      ) : (
        <div className="chat-list">
          {chats.map((chat) => (
            <div key={chat.id} className="chat-item">
              <div className="chat-item-customer">
                Customer: {chat.customerId}
              </div>
              <div className="chat-item-status">Status: {chat.status}</div>
              <button
                onClick={() => handleClaim(chat.id)}
                disabled={claimingChatId === chat.id}
                className="claim-button"
              >
                {claimingChatId === chat.id ? "Claiming..." : "Claim"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalQueue;
