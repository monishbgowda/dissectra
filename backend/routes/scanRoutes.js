const express = require('express');
const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');
const fs = require('fs/promises');
const { analyzeImage } = require('../services/aiAnalysisService');
const { generateModel, getModelJob } = require('../services/modelProvider');
const { addUpload, getUpload } = require('../services/uploadStore');
const { readHistory } = require('../services/historyStore');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'storage', 'uploads');
const modelDir = path.join(__dirname, '..', 'storage', 'models');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname) || '.jpg'}`),
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024) },
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(png|jpe?g|webp)$/i;
    return allowed.test(file.mimetype) ? cb(null, true) : cb(new Error('Only png, jpg, jpeg, and webp images are allowed'));
  },
});

router.get('/health', (_req, res) => res.json({ ok: true, name: 'dissectra-backend' }));

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });
  const uploadId = randomUUID();
  const item = {
    uploadId,
    filename: req.file.filename,
    path: req.file.path,
    mimetype: req.file.mimetype,
    createdAt: new Date().toISOString(),
  };
  addUpload(item);
  res.json({ uploadId, filename: item.filename, imageUrl: `/files/uploads/${item.filename}` });
});

router.post('/analyze', async (req, res, next) => {
  try {
    const file = getUpload(req.body.uploadId);
    if (!file) return res.status(404).json({ error: 'upload not found' });
    const analysis = await analyzeImage(file.path, file.mimetype);
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-model', async (req, res, next) => {
  try {
    const file = getUpload(req.body.uploadId);
    if (!file) return res.status(404).json({ error: 'upload not found' });
    await fs.mkdir(modelDir, { recursive: true });
    const result = await generateModel(req.body.uploadId, file.path, modelDir);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/model-status/:jobId', async (req, res, next) => {
  try {
    const job = await getModelJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (_req, res, next) => {
  try {
    res.json({ items: await readHistory() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
