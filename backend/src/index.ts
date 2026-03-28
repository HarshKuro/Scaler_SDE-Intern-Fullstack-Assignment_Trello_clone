import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import boardRoutes from './routes/boards';
import listRoutes from './routes/lists';
import cardRoutes from './routes/cards';
import labelRoutes from './routes/labels';
import memberRoutes from './routes/members';
import checklistRoutes from './routes/checklists';
import attachmentRoutes from './routes/attachments';
import commentRoutes from './routes/comments';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', labelRoutes);
app.use('/api/members', memberRoutes);
app.use('/api', checklistRoutes);
app.use('/api', attachmentRoutes);
app.use('/api', commentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`KanFlow API server running on http://localhost:${PORT}`);
});

export default app;
