import { Router } from "express";
import { registerUser, login } from "../controllers/user.controller.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', login);

export default router;
