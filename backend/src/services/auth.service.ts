import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/prisma';

// --- Zod Schemas ---
export const registerSchema = z.object({
  email: z.email({ error: 'Email không hợp lệ' }),
  password: z.string().min(6, { error: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ error: 'Email không hợp lệ' }),
  password: z.string().min(1, { error: 'Mật khẩu không được để trống' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// --- Service Functions ---

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new Error('Email đã được sử dụng');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const token = generateToken(user.id, user.email);

  return { token, user };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const token = generateToken(user.id, user.email);
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

// --- Helpers ---
const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ userId, email }, secret, { expiresIn });
};
