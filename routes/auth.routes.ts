import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";

const router = Router();

import { protect, authorize } from "../middleware/authHandler";

router.route("/register").post(register);
router.route("/login").post(login);
router.get("/me", protect, authorize("publisher", "admin"), getMe);

export { router };
