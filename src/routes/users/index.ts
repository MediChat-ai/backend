import { Router } from 'express';
import * as usersController from './users.controller';
import * as changeController from './change.controller';
import * as oauthController from './oauth.controller';

const router = Router();

// Auth routes
router.post('/login', usersController.login);
router.post('/register', usersController.register);
router.get('/auth', usersController.auth);

// Change routes
router.post('/change/username', changeController.changeUsername);
router.post('/change/password', changeController.changePassword);

// OAuth routes
router.post('/oauth/google', oauthController.googleOAuth);
router.post('/oauth/naver', oauthController.naverOAuth);

export default router;
