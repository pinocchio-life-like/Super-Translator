/*
  Warnings:

  - Added the required column `title` to the `TranslationJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TranslationJob" ADD COLUMN     "title" TEXT NOT NULL;
