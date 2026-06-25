import { Router } from "express";
import protect from "../middleware/auth.js";
import { getDashboard } from "../controllers/progressController.js";

const router = Router();

router.use(protect);
router.route("/dashboard").get(getDashboard);

export default router;
