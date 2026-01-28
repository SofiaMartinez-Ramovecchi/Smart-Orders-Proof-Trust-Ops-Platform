// backend/src/jwt/jwt.provider.ts
import { JWT_SERVICE } from '@/jwt/domain';
import { SimpleJwtService } from './infrastructure/simple-jwt.service';

export const JwtProvider = {
  provide: JWT_SERVICE,
  useClass: SimpleJwtService,
};

