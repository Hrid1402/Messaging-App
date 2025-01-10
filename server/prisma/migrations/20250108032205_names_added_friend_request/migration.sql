/*
  Warnings:

  - Added the required column `fromName` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toName` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FriendRequest" ADD COLUMN     "fromName" VARCHAR(35) NOT NULL,
ADD COLUMN     "toName" VARCHAR(35) NOT NULL;
