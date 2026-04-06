import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import tagRoutes from './tag.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/tags', tagRoutes);

export default router;
