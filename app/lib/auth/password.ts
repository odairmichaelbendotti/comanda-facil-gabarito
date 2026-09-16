import bcrypt from "bcryptjs";

// Cost factor. 12 is the usual middle ground in 2026: slow enough that a leaked
// table is expensive to crack, fast enough (~200ms) that signing up doesn't feel
// broken. Raise it as hardware gets cheaper, never lower it.
const SALT_ROUNDS = 12;

export function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(plainPassword: string, passwordHash: string) {
  return bcrypt.compare(plainPassword, passwordHash);
}
