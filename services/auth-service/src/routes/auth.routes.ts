import { registerHandler } from '@/controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest({}), registerHandler);
