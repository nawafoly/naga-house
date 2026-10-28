import test from "node:test";
import assert from "node:assert/strict";

import {
  hasAdminPermission,
} from "../src/features/admin/domain/permissions.ts";

const actions = [
  "dashboard.view",
  "events.view",
  "events.draft.create",
  "events.draft.edit",
  "events.publish",
  "events.delete",
  "admin.users.manage",
];

const allowedByRole = {
  owner: new Set(actions),

  admin: new Set(
    actions.filter(
      (action) => action !== "admin.users.manage"
    )
  ),

  editor: new Set([
    "dashboard.view",
    "events.view",
    "events.draft.create",
    "events.draft.edit",
  ]),
};

for (const [role, allowedActions] of Object.entries(allowedByRole)) {
  test(`${role} has exactly the approved permissions`, () => {
    for (const action of actions) {
      assert.equal(
        hasAdminPermission(role, action),
        allowedActions.has(action),
        `${role} permission: ${action}`
      );
    }
  });
}

test("unknown roles are denied by default", () => {
  const unknownRoles = [
    "viewer",
    "superadmin",
    "__proto__",
    "constructor",
    "",
    null,
    undefined,
  ];

  for (const role of unknownRoles) {
    assert.equal(
      hasAdminPermission(role, "dashboard.view"),
      false
    );
  }
});

test("unknown permissions are denied even for owner", () => {
  assert.equal(
    hasAdminPermission("owner", "events.unknown"),
    false
  );
});