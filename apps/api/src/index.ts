import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { campaignsRouter } from './routes/campaigns.js';
import { creativesRouter } from './routes/creatives.js';
import { websitesRouter } from './routes/websites.js';
import { placementsRouter } from './routes/placements.js';
import { analyticsRouter } from './routes/analytics.js';
import { adminRouter } from './routes/admin.js';
import { adsRouter } from './routes/ads.js';
import { errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.API_PORT) || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: [
      process.env.APP_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
      '*',
    ],
    credentials: true,
  }),
);
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));

const adLimiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use('/api/ads', adLimiter);
app.use('/api/impression', adLimiter);
app.use('/api/click', adLimiter);

const openapiPath = path.join(__dirname, '../../docs/openapi.yaml');
try {
  const swaggerDoc = YAML.load(openapiPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch {
  app.get('/api/docs', (_req, res) => res.redirect('/api/docs/'));
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'waelio-api' }));
app.use('/sdk.js', express.static(path.join(__dirname, '../../../packages/sdk/dist')));

app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/creatives', creativesRouter);
app.use('/api/websites', websitesRouter);
app.use('/api/placements', placementsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);
app.use('/api', adsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Waelio API listening on port ${PORT}`);
});
