import { Router } from 'express';
import prisma from '../prisma';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { babyId } = req.params as any;
  const { category, title, description, achievedAt, photoUrl, note, recorderId } = req.body;
  const milestone = await prisma.milestone.create({
    data: { category, title, description, achievedAt: new Date(achievedAt), photoUrl, note, babyId, recorderId },
  });
  res.json(milestone);
});

router.get('/', async (req, res) => {
  const { babyId } = req.params as any;
  const milestones = await prisma.milestone.findMany({
    where: { babyId },
    orderBy: { achievedAt: 'desc' },
  });
  res.json(milestones);
});

router.delete('/:milestoneId', async (req, res) => {
  await prisma.milestone.delete({ where: { id: req.params.milestoneId } });
  res.json({ success: true });
});

export default router;
