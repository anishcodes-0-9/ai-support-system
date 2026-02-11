import { Hono } from "hono";
import { agentController } from "../controllers/agent.controller.js";

export const agentRoutes = new Hono();

agentRoutes.get("/", agentController.listAgents);
agentRoutes.get("/:type/capabilities", agentController.getCapabilities);
