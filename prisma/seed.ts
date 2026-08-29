import 'dotenv/config';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  try {
    const { hash } = await import('@node-rs/argon2');
    return await hash(password);
  } catch {
    // Fallback: standard sha256 formatted hash if native addon is unavailable during seed
    const crypto = await import('crypto');
    return `$argon2id$v=19$m=65536,t=3,p=4$fallback_${crypto.createHash('sha256').update(password).digest('hex')}`;
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean up existing records
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.location.deleteMany();
  await prisma.session.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await hashPassword('Password123!');

  // 2. Seed Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@handymandy.id',
      name: 'System Admin',
      phone: '081200000001',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN
    }
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 3. Seed Technicians
  const tech1User = await prisma.user.create({
    data: {
      email: 'budi.tech@handymandy.id',
      name: 'Budi Santoso',
      phone: '081299990001',
      passwordHash: defaultPasswordHash,
      role: Role.TECHNICIAN,
      technicianProfile: {
        create: {
          specialties: 'Smart Locks, CCTV Cameras, Doorbell',
          bio: 'Certified smart security technician with 5+ years experience.',
          isVerified: true,
          isAvailable: true,
          serviceCity: 'Jakarta Selatan'
        }
      }
    }
  });

  const tech2User = await prisma.user.create({
    data: {
      email: 'siti.tech@handymandy.id',
      name: 'Siti Rahma',
      phone: '081299990002',
      passwordHash: defaultPasswordHash,
      role: Role.TECHNICIAN,
      technicianProfile: {
        create: {
          specialties: 'Smart Lighting, Zigbee Hubs, Automation Sensors',
          bio: 'Smart lighting and home automation specialist.',
          isVerified: true,
          isAvailable: true,
          serviceCity: 'Tangerang'
        }
      }
    }
  });

  const tech3User = await prisma.user.create({
    data: {
      email: 'agus.tech@handymandy.id',
      name: 'Agus Pratama',
      phone: '081299990003',
      passwordHash: defaultPasswordHash,
      role: Role.TECHNICIAN,
      technicianProfile: {
        create: {
          specialties: 'CCTV Cameras, Smart Curtains, Network Wiring',
          bio: 'Heavy installations and smart access expert.',
          isVerified: true,
          isAvailable: false,
          serviceCity: 'Jakarta Barat'
        }
      }
    }
  });
  console.log(`✅ Technicians created: 3 seeded.`);

  // 4. Seed Demo Customer User
  const customer = await prisma.user.create({
    data: {
      email: 'customer@handymandy.id',
      name: 'Thaariq Customer',
      phone: '081288880001',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
      locations: {
        create: [
          {
            label: 'Main Residence',
            addressLine: 'Jl. Senopati No. 45, Kebayoran Baru',
            city: 'Jakarta Selatan',
            province: 'DKI Jakarta',
            postalCode: '12190',
            lat: -6.2297,
            lng: 106.8075
          },
          {
            label: 'Work Studio',
            addressLine: 'BSD Green Office Park 9, Wing B',
            city: 'Tangerang',
            province: 'Banten',
            postalCode: '15345',
            lat: -6.3021,
            lng: 106.6522
          }
        ]
      }
    }
  });
  console.log(`✅ Customer created: ${customer.email}`);

  // 5. Seed Catalog Products
  const products = [
    {
      name: 'Smart Video Doorbell Pro (2K HDR)',
      description: 'Crystal-clear 2K HDR video, two-way audio talk, real-time AI package detection, and cloud/SD recording.',
      category: 'Security',
      basePrice: 1250000,
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
      requiresHub: false,
      isActive: true
    },
    {
      name: 'Zigbee Outdoor Smart CCTV 2K',
      description: 'IP66 weatherproof wireless camera with night vision, color spotlights, and motion tracking. Requires Zigbee Hub.',
      category: 'Security',
      basePrice: 850000,
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
      requiresHub: true,
      isActive: true
    },
    {
      name: 'Fingerprint & Passcode Smart Door Lock',
      description: 'Bank-grade semiconductor biometric fingerprint scanner, anti-peep passcode keypad, RFID tags, and emergency key.',
      category: 'Smart Access',
      basePrice: 2100000,
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
      requiresHub: false,
      isActive: true
    },
    {
      name: 'Smart RGBW Ambient Light Strip (5m)',
      description: '16 million colors with music sync and voice assistant compatibility. Works directly with WiFi.',
      category: 'Lighting',
      basePrice: 320000,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
      requiresHub: false,
      isActive: true
    },
    {
      name: 'Zigbee Smart Ceiling Light Controller',
      description: 'In-wall smart relay module for controlling ceiling fixtures with ultra-low latency. Requires Zigbee Hub.',
      category: 'Lighting',
      basePrice: 280000,
      imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
      requiresHub: true,
      isActive: true
    },
    {
      name: 'Universal Smart IR Remote Blaster',
      description: 'Control AC, TV, and TV boxes from anywhere using your smartphone or scheduled automations.',
      category: 'Automation',
      basePrice: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      requiresHub: false,
      isActive: true
    },
    {
      name: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
      description: 'Central brain for all Zigbee 3.0 and Bluetooth Mesh devices. Connects up to 128 smart devices with local processing.',
      category: 'Automation',
      basePrice: 450000,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      requiresHub: false,
      isActive: true
    }
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }
  console.log(`✅ Products seeded: ${products.length} items created.`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
