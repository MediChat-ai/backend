import { Router } from 'express';
import * as hospitalController from './hospital.controller';

const router = Router();

router.get('/getHospList', hospitalController.getHospList);

export default router;
