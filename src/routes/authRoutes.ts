import express from 'express';
import { login, logout, register, googleLogin, phoneLogin } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/phone', phoneLogin);
router.get('/logout', logout);

export default router;
