import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counts = {
    SiteContent: await prisma.siteContent.count(),
    AdminUser: await prisma.adminUser.count(),
    Settings: await prisma.settings.count(),
    Subject: await prisma.subject.count(),
    Testimonial: await prisma.testimonial.count(),
    Video: await prisma.video.count(),
    MediaAsset: await prisma.mediaAsset.count(),
  };
  console.table(counts);
  const admin = await prisma.adminUser.findFirst({ select: { email: true, name: true } });
  console.log("Admin user:", admin);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
