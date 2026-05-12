import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: '邮箱和手机号至少填写一个' });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: email || undefined }, { phone: phone || undefined }] },
  });
  if (existing) {
    return res.status(409).json({ error: '该邮箱或手机号已被注册' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: email || null, phone: phone || null, password: hashed },
  });
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone });
});

router.post('/login', async (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).json({ error: '账号和密码不能为空' });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: account }, { phone: account }],
    },
  });
  if (!user) {
    return res.status(401).json({ error: '账号或密码错误' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: '账号或密码错误' });
  }

  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone });
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { babies: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;
