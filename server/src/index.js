import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import healthRoutes from './routes/healthRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import fairRoutes from './routes/fairRoutes.js';
import optimizerRoutes from './routes/optimizerRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';

import { swaggerDocument } from './swagger/swaggerDocument.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Interactive Swagger UI documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'ResilienceOS Decision Engine — OpenAPI Documentation',
  customCss: '.swagger-ui .topbar { background-color: #0c0e14; border-bottom: 1px solid rgba(255,255,255,0.1); }'
}));

// API Routes
app.use('/api', healthRoutes);
app.use('/api', riskRoutes);
app.use('/api', fairRoutes);
app.use('/api', optimizerRoutes);
app.use('/api', graphRoutes);
app.use('/api', simulatorRoutes);
app.use('/api', telemetryRoutes);
app.use('/api', complianceRoutes);

// Root redirect to docs or health
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// Centralized Error Handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ResilienceOS Decision Engine API is running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📚 Interactive Swagger Docs: http://localhost:${PORT}/api/docs`);
    console.log(`====================================================`);
  });
}

export default app;
