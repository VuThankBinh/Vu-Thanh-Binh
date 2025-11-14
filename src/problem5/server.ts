import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import resourcesRouter from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});
app.use('/resources', resourcesRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        details: error.issues,
      });
    }

    console.error(error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  },
);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

