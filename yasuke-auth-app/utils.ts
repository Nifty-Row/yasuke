import { hashSync } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export class ResponseUtils {
  static getSuccessResponse(data: any, message?: string): Response {
    const r: Response = {
      status: 'success',
      message: message,
      data: data,
    };

    return r;
  }
}

export class Response {
  status: string;
  message: string;
  data: any;
}

export const hashPassword = (password: string) => {
  return hashSync(password, 10);
};

const createToken = (payload, duration) => {
  return sign(payload, process.env.JWT_SECRET, { expiresIn: duration });
};

export const generateFreshUserTokens = async (user: object) => {
  const tokenExpiryInSeconds = parseInt(
    process.env.JWT_TOKEN_EXPIRY_IN_SECONDS,
    10
  );
  const tokenExpiresAt = new Date(
    new Date().getTime() + 1000 * tokenExpiryInSeconds
  );
  const accessToken = createToken(
    { ...user, tokenExpiresAt },
    tokenExpiryInSeconds
  );

  return { accessToken };
};
