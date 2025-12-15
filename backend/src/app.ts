import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes";
import officerRoutes from "./routes/officerRoutes";
import messageRoutes from "./routes/messageRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/customers", customerRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/chats", messageRoutes);

export default app;
