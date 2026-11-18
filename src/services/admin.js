export const ADMIN_EMAIL = 'golovatik401@gmail.com';

export function isAdminUser(user, profile) {
  if (!user) return false;
  return user.email === ADMIN_EMAIL || profile?.role === 'admin';
}
