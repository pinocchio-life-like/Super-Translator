/*
  Warnings:

  - Added the required column `translationJobId` to the `ConversationHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConversationHistory" ADD COLUMN     "translationJobId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ConversationHistory" ADD CONSTRAINT "ConversationHistory_translationJobId_fkey" FOREIGN KEY ("translationJobId") REFERENCES "TranslationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
