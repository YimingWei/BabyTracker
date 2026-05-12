import express from 'express';
import cors from 'cors';
import path from 'path';

import usersRouter from './routes/users';
import babiesRouter from './routes/babies';
import recordsRouter from './routes/records';
import photosRouter from './routes/photos';
import milestonesRouter from './routes/milestones';
import growthRouter from './routes/growth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users', usersRouter);
app.use('/api/babies', babiesRouter);
app.use('/api/babies/:babyId/records', recordsRouter);
app.use('/api/babies/:babyId/photos', photosRouter);
app.use('/api/babies/:babyId/milestones', milestonesRouter);
app.use('/api/babies/:babyId/growth', growthRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
