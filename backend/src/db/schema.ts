import db from "./database";

export function initializeSchema(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create officers table
    db.exec(
      `
      CREATE TABLE IF NOT EXISTS officers (
        id TEXT PRIMARY KEY,
        created_at DATETIME
      )
    `,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating officers table:", err);
          reject(err);
          return;
        }

        // Create chats table
        db.exec(
          `
          CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            customer_id TEXT UNIQUE,
            assigned_officer_id TEXT,
            status TEXT,
            created_at DATETIME
          )
        `,
          (err: Error | null) => {
            if (err) {
              console.error("Error creating chats table:", err);
              reject(err);
              return;
            }

            // Create messages table
            db.exec(
              `
              CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                chat_id TEXT,
                sender_type TEXT,
                sender_id TEXT,
                content TEXT,
                created_at DATETIME
              )
            `,
              (err: Error | null) => {
                if (err) {
                  console.error("Error creating messages table:", err);
                  reject(err);
                  return;
                }
                resolve();
              }
            );
          }
        );
      }
    );
  });
}
