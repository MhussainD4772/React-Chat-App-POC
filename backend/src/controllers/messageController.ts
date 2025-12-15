import { Request, Response } from "express";
import { chatRepo } from "../repositories/chatRepo";
import { messageRepo } from "../repositories/messageRepo";
import { randomUUID } from "crypto";
import { io } from "../server";
import { emitNewMessage } from "../socket";

interface SendMessageRequest {
  senderType: "customer" | "officer";
  senderId: string;
  content: string;
}

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { senderType, senderId, content }: SendMessageRequest = req.body;

    const chat = await chatRepo.findById(chatId);
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const message = await messageRepo.create(
      randomUUID(),
      chatId,
      senderType,
      senderId,
      content
    );

    try {
      emitNewMessage(io, chatId, message);
    } catch (error) {
      // Socket failures must not break REST response
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;

    const chat = await chatRepo.findById(chatId);
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const messages = await messageRepo.findByChatId(chatId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
