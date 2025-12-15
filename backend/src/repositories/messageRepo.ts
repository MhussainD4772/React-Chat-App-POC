import db from "../db/database";

export interface Message {
  id: string;
  chatId: string;
  senderType: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const messageRepo = {
  create: (
    id: string,
    chatId: string,
    senderType: string,
    senderId: string,
    content: string
  ): Promise<Message> => {
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();
      db.run(
        "INSERT INTO messages (id, chat_id, sender_type, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [id, chatId, senderType, senderId, content, createdAt],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id,
            chatId,
            senderType,
            senderId,
            content,
            createdAt,
          });
        }
      );
    });
  },

  findByChatId: (chatId: string): Promise<Message[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
        [chatId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(
            rows.map((row) => ({
              id: row.id,
              chatId: row.chat_id,
              senderType: row.sender_type,
              senderId: row.sender_id,
              content: row.content,
              createdAt: row.created_at,
            }))
          );
        }
      );
    });
  },
};
