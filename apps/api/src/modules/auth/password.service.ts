import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Hash a password using bcrypt
   * @param password The plain text password to hash
   * @returns The hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, this.saltRounds);
  }

  /**
   * Validate a password against a hash
   * @param password The plain text password to validate
   * @param hashedPassword The hashed password to validate against
   * @returns True if the password matches the hash, false otherwise
   */
  async validatePassword(
    password: string,
    hashedPassword?: string,
  ): Promise<boolean> {
    if (hashedPassword) {
      return compare(password, hashedPassword);
    }

    // Kiểm tra độ mạnh của mật khẩu
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password The plain text password
   * @param hashedPassword The hashed password
   * @returns True if the password matches the hash, false otherwise
   */
  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
