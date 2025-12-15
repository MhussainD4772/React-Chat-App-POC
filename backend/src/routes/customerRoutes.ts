import { Router } from "express";
import { login } from "../controllers/customerController";

const router = Router();

router.post("/login", login);

export default router;
