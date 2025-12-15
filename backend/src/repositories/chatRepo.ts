import db from "../db/database";

export interface Chat {
  id: string;
  customerId: string;
  assignedOfficerId: string | null;
  status: string;
  createdAt: string;
}

export const chatRepo = {
  findByCustomerId: (customerId: string): Promise<Chat | null> => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM chats WHERE customer_id = ?",
        [customerId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            resolve(null);
            return;
          }
          resolve({
            id: row.id,
            customerId: row.customer_id,
            assignedOfficerId: row.assigned_officer_id,
            status: row.status,
            createdAt: row.created_at,
          });
        }
      );
    });
  },

  create: (
    id: string,
    customerId: string,
    assignedOfficerId: string | null,
    status: string
  ): Promise<Chat> => {
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();
      db.run(
        "INSERT INTO chats (id, customer_id, assigned_officer_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
        [id, customerId, assignedOfficerId, status, createdAt],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id,
            customerId,
            assignedOfficerId,
            status,
            createdAt,
          });
        }
      );
    });
  },

  findAllUnassigned: (): Promise<Chat[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM chats WHERE assigned_officer_id IS NULL",
        [],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(
            rows.map((row) => ({
              id: row.id,
              customerId: row.customer_id,
              assignedOfficerId: row.assigned_officer_id,
              status: row.status,
              createdAt: row.created_at,
            }))
          );
        }
      );
    });
  },

  findByAssignedOfficerId: (officerId: string): Promise<Chat[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM chats WHERE assigned_officer_id = ?",
        [officerId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(
            rows.map((row) => ({
              id: row.id,
              customerId: row.customer_id,
              assignedOfficerId: row.assigned_officer_id,
              status: row.status,
              createdAt: row.created_at,
            }))
          );
        }
      );
    });
  },

  findById: (chatId: string): Promise<Chat | null> => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM chats WHERE id = ?", [chatId], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        if (!row) {
          resolve(null);
          return;
        }
        resolve({
          id: row.id,
          customerId: row.customer_id,
          assignedOfficerId: row.assigned_officer_id,
          status: row.status,
          createdAt: row.created_at,
        });
      });
    });
  },

  assignChat: (chatId: string, officerId: string): Promise<Chat | null> => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE chats SET assigned_officer_id = ?, status = ? WHERE id = ? AND assigned_officer_id IS NULL",
        [officerId, "assigned", chatId],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          if (this.changes === 0) {
            resolve(null);
            return;
          }
          db.get(
            "SELECT * FROM chats WHERE id = ?",
            [chatId],
            (err, row: any) => {
              if (err) {
                reject(err);
                return;
              }
              if (!row) {
                resolve(null);
                return;
              }
              resolve({
                id: row.id,
                customerId: row.customer_id,
                assignedOfficerId: row.assigned_officer_id,
                status: row.status,
                createdAt: row.created_at,
              });
            }
          );
        }
      );
    });
  },
};
