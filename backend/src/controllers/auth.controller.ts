import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { ZodError } from 'zod';

// Known business-logic error messages from authService
const AUTH_ERRORS = new Set(['Email đã được sử dụng', 'Email hoặc mật khẩu không đúng']);

function isSafeErrorMessage(message: string): boolean {
  return AUTH_ERRORS.has(message);
}

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
    if (error instanceof Error && isSafeErrorMessage(error.message)) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại sau' });
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
    if (error instanceof Error && isSafeErrorMessage(error.message)) {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại sau' });
  }
};
