import type { Access, FieldAccess } from "payload";

const hasAdminRole = (user: unknown): boolean => {
  if (!user || typeof user !== "object") {
    return false;
  }

  return "role" in user && user.role === "admin";
};

export const publicRead: Access = () => true;

export const authenticated: Access = ({ req }) => Boolean(req.user);

export const adminOnly: Access = ({ req }) => hasAdminRole(req.user);

export const adminOnlyField: FieldAccess = ({ req }) => hasAdminRole(req.user);

export const adminOrSelfField: FieldAccess = ({ id, req }) => {
  if (hasAdminRole(req.user)) {
    return true;
  }

  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    return false;
  }

  return req.user.id === id;
};

export const adminOrSelf: Access = ({ id, req }) => {
  if (hasAdminRole(req.user)) {
    return true;
  }

  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    return false;
  }

  return req.user.id === id;
};

export const staffOnly: Access = ({ req }) => {
  const user: unknown = req.user;
  if (!user || typeof user !== "object") return false;
  if (!("role" in user)) return false;
  const role = (user as { role: string }).role;
  return role === "admin" || role === "editor" || role === "sales";
};
