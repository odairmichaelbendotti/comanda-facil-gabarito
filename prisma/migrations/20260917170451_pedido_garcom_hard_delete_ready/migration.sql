/*
  Warnings:

  - Added the required column `nome_garcom` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_garcom_id_fkey";

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "nome_garcom" TEXT,
ALTER COLUMN "garcom_id" DROP NOT NULL;

-- Backfill: copia o nome do garçom atual para as linhas existentes antes de
-- travar a coluna como NOT NULL.
UPDATE "pedidos" SET "nome_garcom" = "usuarios"."nome"
FROM "usuarios"
WHERE "usuarios"."id" = "pedidos"."garcom_id";

ALTER TABLE "pedidos" ALTER COLUMN "nome_garcom" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_garcom_id_fkey" FOREIGN KEY ("garcom_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
