-- CreateTable
CREATE TABLE "TablaMeta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ultimaModificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TablaMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TablaMeta_nombre_key" ON "TablaMeta"("nombre");
