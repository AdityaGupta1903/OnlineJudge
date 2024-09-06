-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "pId" SERIAL NOT NULL,
    "TestCase" TEXT NOT NULL,
    "args" TEXT NOT NULL,
    "sign" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "TestCaseResults" TEXT NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("pId")
);

-- CreateTable
CREATE TABLE "Submission" (
    "subId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("subId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("pId") ON DELETE RESTRICT ON UPDATE CASCADE;
