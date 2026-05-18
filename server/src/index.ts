import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import contentRoutes from './routes/contentRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import communityRoutes from './routes/communityRoutes';
import marketingRoutes from './routes/marketingRoutes';
import { getJwtSecret } from './lib/jwtSecret';
import { createCorsMiddleware } from './lib/corsPolicy';

dotenv.config();
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 3001;

// D-12: style-src 'unsafe-inline' required for Tailwind + admin customCss until server-side CSS pipeline exists.
const isDev = process.env.NODE_ENV !== 'production';
const connectSrc = ["'self'"];
if (isDev) {
  connectSrc.push('http://localhost:5173', 'ws://localhost:5173', 'http://localhost:3001');
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        connectSrc,
      },
    },
  }),
);
app.use(createCorsMiddleware());
app.use(express.json());

// Routes
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/marketing', marketingRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[🚀] Server is running on http://localhost:${PORT}`);
});
