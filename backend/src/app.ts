import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (phải đặt sau tất cả routes)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.name === 'SyntaxError') {
    res.status(400).json({ message: 'Request body không phải JSON hợp lệ' });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
});

// Only start the server when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}

export default app;
