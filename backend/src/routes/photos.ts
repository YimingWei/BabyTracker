import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import prisma from '../prisma';

const UPLOAD_DIR = path.join(__dirname, '../../uploads/photos');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});
const upload = multer({ storage });

const router = Router({ mergeParams: true });

router.post('/', upload.single('photo'), async (req, res) => {
  const { babyId } = req.params as any;
  const { caption, tags, uploaderId } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

  const url = `/uploads/photos/${req.file.filename}`;
  const photo = await prisma.photo.create({
    data: { url, caption, tags: tags as string, babyId, uploaderId },
  });
  res.json(photo);
});

router.get('/', async (req, res) => {
  const { babyId } = req.params as any;
  const photos = await prisma.photo.findMany({
    where: { babyId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(photos);
});

router.delete('/:photoId', async (req, res) => {
  await prisma.photo.delete({ where: { id: req.params.photoId } });
  res.json({ success: true });
});

export default router;
