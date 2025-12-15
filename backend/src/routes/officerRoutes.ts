import { Router } from "express";
import {
  createOfficer,
  getQueue,
  getOfficerChats,
  claimChat,
} from "../controllers/officerController";

const router = Router();

router.post("/", createOfficer);
router.get("/queue", getQueue);
router.get("/:officerId/chats", getOfficerChats);
router.post("/:officerId/claim/:chatId", claimChat);

export default router;
