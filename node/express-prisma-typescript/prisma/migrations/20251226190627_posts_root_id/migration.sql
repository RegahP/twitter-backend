/*
  Warnings:

  - A unique constraint covering the columns `[rootId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "rootId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Post_rootId_key" ON "Post"("rootId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
