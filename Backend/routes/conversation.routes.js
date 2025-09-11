import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { processConversation } from '../controllers/conversationController.js';

const router = express.Router();

// --- Multer Setup for Audio File Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post('/', upload.single('audio'), processConversation);

export default router;