import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import contentRoutes from './routes/contentRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import communityRoutes from './routes/communityRoutes';
import { getJwtSecret } from './lib/jwtSecret';

dotenv.config();
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173', 
  'http://localhost:5174',
  'https://superhumanly-thoughts.com'
];

app.use(helmet());
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Cross-Origin Request Blocked by Vellux Security Policy'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[🚀] Server is running on http://localhost:${PORT}`);
});
