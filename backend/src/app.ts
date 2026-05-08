import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error.middleware';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/documents.routes';
import extractionRoutes from './routes/extraction.routes';
import reviewRoutes from './routes/review.routes';
import pocRoutes from './routes/poc.routes';
import riskRoutes from './routes/risk.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3001', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

app.use('/api/v1', healthRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', documentRoutes);
app.use('/api/v1', extractionRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1', pocRoutes);
app.use('/api/v1', riskRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Healthcare Document API v1.0', docs: '/api/v1/health' });
});

app.use(errorMiddleware);

export default app;
