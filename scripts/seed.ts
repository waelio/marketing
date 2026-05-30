import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@waelio.com' },
    update: {},
    create: {
      email: 'admin@waelio.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const advertiserUser = await prisma.user.upsert({
    where: { email: 'advertiser@demo.com' },
    update: {},
    create: {
      email: 'advertiser@demo.com',
      passwordHash: await bcrypt.hash('Advertiser123!', 12),
      firstName: 'Demo',
      lastName: 'Advertiser',
      role: 'ADVERTISER',
      emailVerified: true,
      advertiser: { create: { company: 'Demo Ads Inc' } },
    },
    include: { advertiser: true },
  });

  const publisherUser = await prisma.user.upsert({
    where: { email: 'publisher@demo.com' },
    update: {},
    create: {
      email: 'publisher@demo.com',
      passwordHash: await bcrypt.hash('Publisher123!', 12),
      firstName: 'Demo',
      lastName: 'Publisher',
      role: 'PUBLISHER',
      emailVerified: true,
      publisher: { create: { company: 'Demo Media' } },
    },
    include: { publisher: true },
  });

  const advertiser = await prisma.advertiser.findUnique({
    where: { userId: advertiserUser.id },
  });
  const publisher = await prisma.publisher.findUnique({
    where: { userId: publisherUser.id },
  });

  if (!advertiser || !publisher) throw new Error('Seed profiles missing');

  const website = await prisma.website.upsert({
    where: { publisherId_domain: { publisherId: publisher.id, domain: 'demo-blog.com' } },
    update: {},
    create: {
      publisherId: publisher.id,
      name: 'Demo Blog',
      domain: 'demo-blog.com',
      url: 'https://demo-blog.com',
      status: 'APPROVED',
      category: 'Technology',
      reviewedAt: new Date(),
      reviewedBy: admin.id,
    },
  });

  const placement = await prisma.placement.upsert({
    where: { id: 'seed-placement-1' },
    update: {},
    create: {
      id: 'seed-placement-1',
      websiteId: website.id,
      name: 'Homepage Banner',
      size: 'MEDIUM_RECTANGLE',
      width: 300,
      height: 250,
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: 'seed-campaign-1' },
    update: {},
    create: {
      id: 'seed-campaign-1',
      advertiserId: advertiser.id,
      name: 'Spring Launch CPC',
      status: 'ACTIVE',
      pricingModel: 'CPC',
      bidAmount: 0.75,
      dailyBudget: 100,
      totalBudget: 1000,
      priority: 8,
      geoTargets: ['US', 'GB', 'CA'],
      deviceTargets: ['desktop', 'mobile'],
      browserTargets: ['chrome', 'firefox', 'safari'],
      frequencyCap: 5,
      frequencyPeriod: 24,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
    },
  });

  await prisma.creative.upsert({
    where: { id: 'seed-creative-1' },
    update: {},
    create: {
      id: 'seed-creative-1',
      campaignId: campaign.id,
      name: 'Banner 300x250',
      type: 'IMAGE',
      width: 300,
      height: 250,
      imageUrl: 'https://placehold.co/300x250/2563eb/ffffff?text=Waelio+Ads',
      clickUrl: 'https://waelio.com',
    },
  });

  const cpmCampaign = await prisma.campaign.upsert({
    where: { id: 'seed-campaign-2' },
    update: {},
    create: {
      id: 'seed-campaign-2',
      advertiserId: advertiser.id,
      name: 'Brand Awareness CPM',
      status: 'ACTIVE',
      pricingModel: 'CPM',
      bidAmount: 4.5,
      dailyBudget: 50,
      totalBudget: 500,
      priority: 6,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
    },
  });

  await prisma.creative.upsert({
    where: { id: 'seed-creative-2' },
    update: {},
    create: {
      id: 'seed-creative-2',
      campaignId: cpmCampaign.id,
      name: 'Leaderboard',
      type: 'IMAGE',
      width: 728,
      height: 90,
      imageUrl: 'https://placehold.co/728x90/7c3aed/ffffff?text=Brand',
      clickUrl: 'https://waelio.com/products',
    },
  });

  await prisma.fraudEvent.create({
    data: {
      type: 'suspicious_click_velocity',
      severity: 'medium',
      placementId: placement.id,
      metadata: { clicksPerMinute: 120, threshold: 60 },
    },
  });

  console.log('Seed complete:');
  console.log('  Admin: admin@waelio.com / Admin123!');
  console.log('  Advertiser: advertiser@demo.com / Advertiser123!');
  console.log('  Publisher: publisher@demo.com / Publisher123!');
  console.log(`  Placement ID: ${placement.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
