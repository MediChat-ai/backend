import { Router } from 'express';
import usersRouter from './users';
import communityRouter from './community';
import hospitalRouter from './hospital';

const router = Router();

router.use('/users', usersRouter);
router.use('/community', communityRouter);
router.use('/hospital', hospitalRouter);

export default router;
