import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { config } from './config';
import { notificationsRouter } from './routes/notifications';
import { paymentsRouter } from './routes/payments';
import { webhookRouter } from './routes/webhook';

export const app = express();

app.use(
  cors({
    origin: config.corsOrigins.length > 0 ? config.corsOrigins : true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/payments', paymentsRouter);
app.use('/api/payments', webhookRouter);
app.use('/api/notifications', notificationsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('[server] Kesalahan tak tertangani:', error);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
};
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Backend pembayaran berjalan di http://localhost:${config.port}`);
  });
}
