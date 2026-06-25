import { Router } from "express";
import protect from "../middleware/auth.js";
import upload from "../config/multer.js";

import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import multer from "multer";

const router = Router();

// all routes are protected
router.use(protect);

router.route("/upload").post(upload.single("file"), uploadDocument);
router.route("/").get(getDocuments);
router.route("/:id").get(getDocument);
router.route("/:id").delete(deleteDocument);

export default router;
