-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "companyDescription" TEXT,
ADD COLUMN     "companyIndustry" TEXT,
ADD COLUMN     "companyLogoUrl" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyWebsite" TEXT,
ADD COLUMN     "cvLanguages" TEXT,
ADD COLUMN     "cvSkills" TEXT,
ADD COLUMN     "showCompanySection" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showCvSection" BOOLEAN NOT NULL DEFAULT false;
