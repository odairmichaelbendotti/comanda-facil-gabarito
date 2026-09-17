-- Funcionários agora são removidos de verdade (hard delete) em vez de soft
-- delete. As linhas já marcadas com deleted_at sob a semântica antiga
-- precisam sair de fato agora, senão "reapareceriam" como ativas assim que
-- a coluna (e o filtro que a usava) deixar de existir.
DELETE FROM "usuarios" WHERE "deleted_at" IS NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "deleted_at";
