import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { ZodError } from 'zod';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = authService.registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    if (error instanceof Error) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = authService.loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
