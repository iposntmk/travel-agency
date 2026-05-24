import type { AccessContext } from "@/types/domain";

export const isAdmin = ({ role }: AccessContext): boolean => role === "admin";
export const isStaff = ({ role }: AccessContext): boolean =>
  role === "admin" || role === "sales" || role === "editor";
export const isAuthenticated = ({ role }: AccessContext): boolean => role !== "public";

export const publicRead = (): boolean => true;
export const adminOnly = (context: AccessContext): boolean => isAdmin(context);
export const staffOnly = (context: AccessContext): boolean => isStaff(context);
