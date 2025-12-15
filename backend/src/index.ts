import { httpServer } from "./server";
import { initializeSchema } from "./db/schema";

const PORT = process.env.PORT || 3001;

initializeSchema()
  .then(() => {
    console.log("Database initialized");
    httpServer.listen(PORT, () => {
      console.log("Backend server running");
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
