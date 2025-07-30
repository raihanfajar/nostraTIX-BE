const { PrismaClient } = require("./../src/generated/prisma");

const prisma = new PrismaClient();

// Tipe data (: string) dihapus dari fungsi
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, '')   // Hapus karakter yang tidak valid
    .replace(/\-\-+/g, '-');    // Ganti -- ganda dengan satu -
}

const imageUrls = [
  "https://images.unsplash.com/photo-1571470804270-af65e8b3d106?q=80&w=1631&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1686593922853-0b6ba460f2c6?q=80&w=1567&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1674718013659-6930c469e641?q=80&w=1632&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1470345961863-06d4b12d93b3?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1507010430300-19de132ce5ea?q=80&w=1631&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

// Enum Category diubah menjadi array string biasa
const categories = [
  "MUSIC",
  "ARTS",
  "FOOD",
  "BUSINESS",
  "DATING",
];

const eventsToSeed = [
  {
    name: "Jakarta International Jazz Festival 2025",
    description: "Nikmati alunan jazz dari musisi ternama dunia.",
    location: "JIExpo Kemayoran, Jakarta",
    startDate: new Date("2025-09-05T16:00:00Z"),
    endDate: new Date("2025-09-07T23:00:00Z"),
  },
  {
    name: "Art Jakarta 2025: Synthesis",
    description: "Pameran seni rupa kontemporer.",
    location: "Jakarta Convention Center (JCC)",
    startDate: new Date("2025-10-10T10:00:00Z"),
    endDate: new Date("2025-10-12T20:00:00Z"),
  },
  {
    name: "Nusantara Food Fair",
    description: "Jelajahi kekayaan kuliner Indonesia.",
    location: "Plaza Senayan, Jakarta",
    startDate: new Date("2025-08-15T11:00:00Z"),
    endDate: new Date("2025-08-18T21:00:00Z"),
  },
  {
    name: "Indonesia Tech Summit 2025",
    description: "Konferensi teknologi terbesar di Indonesia.",
    location: "ICE BSD, Tangerang",
    startDate: new Date("2025-11-20T09:00:00Z"),
    endDate: new Date("2025-11-21T17:00:00Z"),
  },
  {
    name: "Speed Dating Night: Find Your Match",
    description: "Kesempatan untuk bertemu para lajang profesional.",
    location: "Skye Bar, Jakarta Pusat",
    startDate: new Date("2025-08-30T19:00:00Z"),
    endDate: new Date("2025-08-30T22:00:00Z"),
  },
  {
    name: "Bandung Music Fest: Indie Showcase",
    description: "Panggung bagi band-band indie lokal.",
    location: "Sabuga, Bandung",
    startDate: new Date("2025-09-27T15:00:00Z"),
    endDate: new Date("2025-09-27T23:00:00Z"),
  },
  {
    name: "Ubud Writers & Readers Festival",
    description: "Festival literasi internasional.",
    location: "Ubud, Bali",
    startDate: new Date("2025-10-22T09:00:00Z"),
    endDate: new Date("2025-10-26T18:00:00Z"),
  },
  {
    name: "Surabaya Food Expo",
    description: "Pameran industri makanan dan minuman.",
    location: "Grand City Convex, Surabaya",
    startDate: new Date("2025-11-05T10:00:00Z"),
    endDate: new Date("2025-11-08T19:00:00Z"),
  },
  {
    name: "Digital Marketing Conference",
    description: "Pelajari tren dan strategi pemasaran digital.",
    location: "Hotel Mulia, Jakarta",
    startDate: new Date("2025-09-18T09:00:00Z"),
    endDate: new Date("2025-09-18T17:00:00Z"),
  },
  {
    name: "Electro Night with Local Heroes",
    description: "Malam penuh irama musik elektronik.",
    location: "Dragonfly Club, Jakarta",
    startDate: new Date("2025-08-23T22:00:00Z"),
    endDate: new Date("2025-08-24T03:00:00Z"),
  },
];

async function main() {
  console.log(`Start seeding ...`);
  const organizerId = '68749863-b633-40c0-8f0a-fb01af58e7d0';

  for (let i = 0; i < eventsToSeed.length; i++) {
    const eventData = eventsToSeed[i];
    const imageUrl = imageUrls[i % imageUrls.length];
    const category = categories[i % categories.length];

    const newEvent = await prisma.event.create({
      data: {
        ...eventData,
        slug: slugify(eventData.name),
        organizerId: organizerId,
        category: category,
        totalRating: 0,
      },
    });

    console.log(`Created event: ${newEvent.name} (Category: ${category})`);

    await prisma.eventPicture.create({
      data: {
        eventId: newEvent.id,
        banner: imageUrl,
        picture1: imageUrl,
        picture2: null,
        picture3: null,
      },
    });

    console.log(` -> Added pictures for ${newEvent.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });