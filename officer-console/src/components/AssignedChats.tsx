import { Chat } from "../api";

interface AssignedChatsProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

function AssignedChats({
  chats,
  onSelectChat,
  selectedChatId,
}: AssignedChatsProps): JSX.Element {
  return (
    <div>
      <h2>Assigned Chats</h2>
      {chats.length === 0 ? (
        <div className="empty-state">No assigned chats</div>
      ) : (
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                selectedChatId === chat.id ? "chat-item-selected" : ""
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-item-customer">
                Customer: {chat.customerId}
              </div>
              <div className="chat-item-status">Status: {chat.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssignedChats;
