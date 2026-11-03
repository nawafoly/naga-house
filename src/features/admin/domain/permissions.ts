/**
 * NAGA HOUSE — Admin authorization policy.
 *
 * Permissions are defined centrally.
 * Unknown roles and unsupported permissions are denied.
 */

export type AdminRole =
  | "owner"
  | "admin"
  | "editor";

export type AdminPermission =
  | "dashboard.view"
  | "events.view"
  | "events.draft.create"
  | "events.draft.edit"
  | "events.publish"
  | "events.delete"
  | "admin.users.manage";

const rolePermissions: Record<
  AdminRole,
  readonly AdminPermission[]
> = {
  owner: [
    "dashboard.view",
    "events.view",
    "events.draft.create",
    "events.draft.edit",
    "events.publish",
    "events.delete",
    "admin.users.manage",
  ],

  admin: [
    "dashboard.view",
    "events.view",
    "events.draft.create",
    "events.draft.edit",
    "events.publish",
    "events.delete",
  ],

  editor: [
    "dashboard.view",
    "events.view",
    "events.draft.create",
    "events.draft.edit",
  ],
};

/**
 * Returns false for unknown roles and denied permissions.
 *
 * This function checks action-level permissions.
 * Future editing endpoints must also validate
 * event-level ownership when applicable.
 */
export function hasAdminPermission(
  role: string | null | undefined,
  permission: AdminPermission
): boolean {
  if (
    typeof role !== "string" ||
    !Object.hasOwn(rolePermissions, role)
  ) {
    return false;
  }

  return rolePermissions[
    role as AdminRole
  ].includes(permission);
}