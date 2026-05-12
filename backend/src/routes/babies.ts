import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.post('/', async (req, res) => {
  const { name, birthDate, gender, birthWeight, birthHeight, ownerId } = req.body;
  try {
    const baby = await prisma.baby.create({
      data: { name, birthDate: new Date(birthDate), gender, birthWeight, birthHeight, ownerId },
    });
    res.json(baby);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create baby' });
  }
});

router.get('/:id', async (req, res) => {
  const baby = await prisma.baby.findUnique({
    where: { id: req.params.id },
    include: {
      records: { orderBy: { startedAt: 'desc' }, take: 50 },
      photos: { orderBy: { createdAt: 'desc' }, take: 20 },
      milestones: { orderBy: { achievedAt: 'desc' } },
      growthRecords: { orderBy: { date: 'desc' } },
    },
  });
  if (!baby) return res.status(404).json({ error: 'Baby not found' });
  res.json(baby);
});

router.put('/:id', async (req, res) => {
  const { name, gender, birthWeight, birthHeight, avatar } = req.body;
  const baby = await prisma.baby.update({
    where: { id: req.params.id },
    data: { name, gender, birthWeight, birthHeight, avatar },
  });
  res.json(baby);
});

router.delete('/:id', async (req, res) => {
  await prisma.baby.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
