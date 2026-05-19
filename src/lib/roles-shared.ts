export type UserRole = "user" | "seller" | "admin" | "super_admin";

const HIERARCHY: Record<UserRole, number> = {
  user: 0,
  seller: 1,
  admin: 2,
  super_admin: 3,
};

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return HIERARCHY[userRole] >= HIERARCHY[required];
}
