import { Hono } from "hono";
import { chatController } from "../controllers/chat.controller.js";

export const chatRoutes = new Hono();

chatRoutes.post("/messages", chatController.sendMessage);
