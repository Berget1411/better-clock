-- Migration: Backfill personal organisations for existing users
--
-- Run this ONCE after applying the new schema (organization, member,
-- tracker_project.organization_id, tracker_tag.organization_id,
-- time_entry.organization_id columns).
--
-- What it does:
--   0. Normalise any personal-org slugs that were created with the old
--      timestamp-suffix pattern (e.g. "ludvigs-workspace-1234567890") to
--      the canonical 'personal-<userId>' slug so the client code can find them.
--   1. For every user that still has no personal org, create one in
--      the `organization` table and add them as owner in `member`.
--   2. Assign all existing tracker_project, tracker_tag, and time_entry
--      rows (where organization_id is NULL or a placeholder) to that
--      user's personal org.
--
-- NOTE: This script is idempotent — re-running it is safe because each
-- step checks for prior existence before inserting.

BEGIN;

-- Step 0: Normalise the slug of orgs that were created as the sole org for a
-- user but used the old timestamp-based slug. We identify them as: the user
-- is the only owner-member and the org slug does NOT already match
-- 'personal-<userId>'. We only touch orgs where the user is the *only* member
-- (i.e. truly a personal workspace, not a team org accidentally included).

UPDATE organization o
SET slug = 'personal-' || m.user_id
FROM member m
WHERE m.organization_id = o.id
  AND m.role = 'owner'
  AND o.slug NOT LIKE 'personal-%'
  AND NOT EXISTS (
      SELECT 1 FROM organization o2
      WHERE o2.slug = 'personal-' || m.user_id
  )
  AND (
      SELECT count(*) FROM member m2 WHERE m2.organization_id = o.id
  ) = 1;

-- Step 1: Insert a personal organisation for every user who doesn't have one.
-- We identify a "personal" org by the slug pattern 'personal-<userId>'.

INSERT INTO organization (id, name, slug, created_at)
SELECT
    -- Use a stable deterministic ID so re-runs don't create duplicates.
    -- format: 'personal-' || user.id (truncated to 36 chars if needed)
    substring('personal-' || u.id, 1, 36) AS id,
    u.name || '''s Workspace'              AS name,
    'personal-' || u.id                   AS slug,
    now()                                  AS created_at
FROM "user" u
WHERE NOT EXISTS (
    SELECT 1 FROM organization o WHERE o.slug = 'personal-' || u.id
);

-- Step 2: Add the user as owner of their personal org (if not already a member).

INSERT INTO member (id, organization_id, user_id, role, created_at)
SELECT
    'member-personal-' || u.id             AS id,
    substring('personal-' || u.id, 1, 36) AS organization_id,
    u.id                                   AS user_id,
    'owner'                                AS role,
    now()                                  AS created_at
FROM "user" u
WHERE NOT EXISTS (
    SELECT 1
    FROM member m
    WHERE m.organization_id = substring('personal-' || u.id, 1, 36)
      AND m.user_id = u.id
);

-- Step 3: Back-fill tracker_project rows that have no organization_id.
-- (Rows added before this migration will have organization_id = '' or NULL
--  depending on the column default. Adjust the WHERE clause if needed.)

UPDATE tracker_project tp
SET organization_id = substring('personal-' || tp.user_id, 1, 36)
WHERE tp.organization_id IS NULL
   OR tp.organization_id = '';

-- Step 4: Back-fill tracker_tag rows.

UPDATE tracker_tag tt
SET organization_id = substring('personal-' || tt.user_id, 1, 36)
WHERE tt.organization_id IS NULL
   OR tt.organization_id = '';

-- Step 5: Back-fill time_entry rows.

UPDATE time_entry te
SET organization_id = substring('personal-' || te.user_id, 1, 36)
WHERE te.organization_id IS NULL
   OR te.organization_id = '';

COMMIT;
