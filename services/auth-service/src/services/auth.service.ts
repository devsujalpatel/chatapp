import { sequelize } from '@/db/sequelize';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, RegisterInput } from '@/types/auth';
import { hashPassword } from '@/utils/token';
import { HttpError } from '@chatapp/common';
import { Op, Transaction } from 'sequelize';
import crypto from 'crypto';

const REFRESH_TOKEN_TTL_DAYS = 30;

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existing = await UserCredentials.findOne({
    where: { email: { [Op.eq]: input.email } },
  });
  if (existing) {
    throw new HttpError(409, 'User with this email already exists');
  }
  const transaction = await sequelize.transaction();
  try {
    const passwordHash = await hashPassword(input.password);
    const user = await UserCredentials.create(
      {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
      },
      { transaction },
    );
    const refreshTokenRecord = await createRereshToken(user.id, transaction);
    await transaction.commit();
  } catch (erro) {}
};

const createRereshToken = async (userId: string, transaction?: Transaction) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS); // 30 days from now

  const tokenId = crypto.randomUUID();

  const record = await RefreshToken.create(
    {
      userId,
      tokenId,
      expiresAt,
    },
    { transaction },
  );

  return record;
};
