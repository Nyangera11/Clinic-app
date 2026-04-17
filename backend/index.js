import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './src/routes/index.js';
import { initDb } from './src/config/db.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 4000;
const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// API routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

// Serve static frontend files
app.use(express.static(distPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mobile Health Clinic API' });
});

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ status: 'ok', message: 'Mobile Health Clinic API' });
    }
  });
});

app.use(errorHandler);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Clinic backend listening on http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
      console.log(`Frontend served from ${distPath}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed', error);
    process.exit(1);
  });
