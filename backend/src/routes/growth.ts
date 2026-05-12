import { Router } from 'express';
import prisma from '../prisma';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { babyId } = req.params as any;
  const { date, weight, height, headCircumference, note, recorderId } = req.body;
  const record = await prisma.growthRecord.create({
    data: { date: new Date(date), weight, height, headCircumference, note, babyId, recorderId },
  });
  res.json(record);
});

router.get('/', async (req, res) => {
  const { babyId } = req.params as any;
  const records = await prisma.growthRecord.findMany({
    where: { babyId },
    orderBy: { date: 'asc' },
  });
  res.json(records);
});

router.get('/curve', async (req, res) => {
  const { babyId } = req.params as any;
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return res.status(404).json({ error: 'Baby not found' });

  const records = await prisma.growthRecord.findMany({
    where: { babyId },
    orderBy: { date: 'asc' },
  });

  // 计算月龄和生长曲线数据
  const birthDate = new Date(baby.birthDate);
  const curveData = records.map(r => {
    const months = (new Date(r.date).getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return {
      date: r.date,
      months: Math.round(months * 10) / 10,
      weight: r.weight,
      height: r.height,
      headCircumference: r.headCircumference,
    };
  });

  res.json(curveData);
});

router.delete('/:recordId', async (req, res) => {
  await prisma.growthRecord.delete({ where: { id: req.params.recordId } });
  res.json({ success: true });
});

export default router;
