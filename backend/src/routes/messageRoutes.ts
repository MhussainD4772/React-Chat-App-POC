import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController";

const router = Router();

router.post("/:chatId/messages", sendMessage);
router.get("/:chatId/messages", getMessages);

export default router;
