import { createAccessControl } from "better-auth/plugins/access";
import {
	defaultStatements,
	adminAc,
} from "better-auth/plugins/admin/access";

/**
 * Access Control Configuration for GC.OS CMS
 *
 * Roles:
 * - admin: Full access including user management
 * - user: Full CMS access except user management
 */

// Merge default statements with our custom statements
const statement = {
	...defaultStatements,
	// CMS content management
	content: ["create", "read", "update", "delete"],
	// User management - only admins can do this
	users: ["create", "read", "update", "delete"],
} as const;

// Create the access control instance
export const ac = createAccessControl(statement);

// Admin role - full access to everything including user management
export const admin = ac.newRole({
	content: ["create", "read", "update", "delete"],
	users: ["create", "read", "update", "delete"],
	...adminAc.statements,
});

// User role - full CMS access but NO user management
export const user = ac.newRole({
	content: ["create", "read", "update", "delete"],
	// No users permissions - they cannot manage users
});



