import db from "../db/database";

export interface Officer {
  id: string;
  createdAt: string;
}

export const officerRepo = {
  findById: (id: string): Promise<Officer | null> => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM officers WHERE id = ?", [id], (err, row: any) => {
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
          createdAt: row.created_at,
        });
      });
    });
  },

  create: (id: string): Promise<Officer> => {
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();
      db.run(
        "INSERT INTO officers (id, created_at) VALUES (?, ?)",
        [id, createdAt],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id,
            createdAt,
          });
        }
      );
    });
  },
};
