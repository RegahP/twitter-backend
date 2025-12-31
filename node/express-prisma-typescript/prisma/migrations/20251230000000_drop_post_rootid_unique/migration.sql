-- Drop the incorrect uniqueness constraint on Post.rootId.
-- rootId is intended to be shared by many comments in the same thread.

DROP INDEX IF EXISTS "Post_rootId_key";

-- Add non-unique indexes to speed up common comment queries.
CREATE INDEX IF NOT EXISTS "Post_parentId_idx" ON "Post"("parentId");
CREATE INDEX IF NOT EXISTS "Post_rootId_idx" ON "Post"("rootId");
