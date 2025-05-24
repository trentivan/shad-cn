-- CreateTable
CREATE TABLE "Buque" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "agenciaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "loa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Buque" ADD CONSTRAINT "Buque_agenciaId_fkey" FOREIGN KEY ("agenciaId") REFERENCES "Agencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
