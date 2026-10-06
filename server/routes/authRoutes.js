import { Router } from 'express';
import { login, register, getUsuarios } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/usuarios', getUsuarios);

export default router;