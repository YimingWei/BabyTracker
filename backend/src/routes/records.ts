import { Router } from 'express';
import prisma from '../prisma';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { babyId } = req.params as any;
  const { type, startedAt, endedAt, duration, feedingType, amount, leftBreast, rightBreast, diaperType, color, texture, note, creatorId } = req.body;
  try {
    const record = await prisma.record.create({
      data: {
        type, babyId, creatorId,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : null,
        duration, feedingType, amount, leftBreast, rightBreast,
        diaperType, color, texture, note,
      },
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.get('/', async (req, res) => {
  const { babyId } = req.params as any;
  const { type, date } = req.query as { type?: string; date?: string };
  const where: any = { babyId };
  if (type) where.type = type;
  if (date) {
    const d = new Date(date);
    where.startedAt = {
      gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
    };
  }
  const records = await prisma.record.findMany({
    where,
    orderBy: { startedAt: 'desc' },
  });
  res.json(records);
});

router.get('/stats/today', async (req, res) => {
  const { babyId } = req.params as any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const records = await prisma.record.findMany({
    where: { babyId, startedAt: { gte: today, lt: tomorrow } },
  });

  const stats = {
    feedingCount: records.filter(r => r.type === 'FEEDING').length,
    totalSleepMinutes: records.filter(r => r.type === 'SLEEP').reduce((sum, r) => sum + (r.duration || 0), 0),
    diaperCount: records.filter(r => r.type === 'DIAPER').length,
    lastFeeding: records.find(r => r.type === 'FEEDING'),
    lastSleep: records.find(r => r.type === 'SLEEP'),
  };
  res.json(stats);
});

router.delete('/:recordId', async (req, res) => {
  await prisma.record.delete({ where: { id: req.params.recordId } });
  res.json({ success: true });
});

export default router;
