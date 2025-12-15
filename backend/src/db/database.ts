import * as sqlite3 from "sqlite3";
import path from "path";

sqlite3.verbose();

const dbPath = path.join(__dirname, "../../database.sqlite");

const db = new sqlite3.Database(dbPath, (err: Error | null) => {
  if (err) {
    console.error("Database connection error:", err);
  }
});

export default db;
