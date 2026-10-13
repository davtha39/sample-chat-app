/*
  Warnings:

  - You are about to drop the column `userAgent` on the `chat` table. All the data in the column will be lost.
  - Added the required column `user_agent` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chat` DROP COLUMN `userAgent`,
    ADD COLUMN `user_agent` VARCHAR(191) NOT NULL;
