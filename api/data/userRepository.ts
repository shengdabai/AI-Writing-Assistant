import type { User } from '../types/index.js';

// Prototype adapter: one process only. Replace with a durable DB before multi-instance deployment.
export function createInMemoryUserRepository() {
  const users = new Map<string, User>();
  const normalizeEmail = (email: string) => email.trim().toLowerCase();
  const findByEmail = (email: string) => [...users.values()].find(user => user.email === normalizeEmail(email));
  return {
    findById: (id: string) => users.get(id),
    findByEmail,
    create(user: User): boolean {
      if (users.has(user.id) || findByEmail(user.email)) return false;
      users.set(user.id, { ...user, email: normalizeEmail(user.email) });
      return true;
    },
    delete: (id: string) => users.delete(id),
  };
}
export const userRepository = createInMemoryUserRepository();
