import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
}

// Mở rộng Express Request để thêm thông tin user sau khi xác thực
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
