import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------ */
/* Password hashing                                                    */
/*                                                                     */
/* NEVER store a password as typed. bcrypt hashes it with a random     */
/* salt — even we can't reverse it. To check a login, we hash what     */
/* the user typed and see if it matches the stored hash.               */
/* ------------------------------------------------------------------ */

const ROUNDS = 10; // cost factor — higher = slower = harder to brute-force

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
