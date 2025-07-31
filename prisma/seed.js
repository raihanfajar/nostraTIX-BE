const { PrismaClient } = require("./../src/generated/prisma");
const { Country, City } = require('country-state-city');

const prisma = new PrismaClient();

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// FUNGSI BARU: Membuat tanggal acak yang valid
function createRandomDates() {
  const year = 2025;
  const month = Math.floor(Math.random() * 12); // 0-11
  const day = Math.floor(Math.random() * 28) + 1; // Maksimal 28 agar aman untuk semua bulan
  
  const startDate = new Date(year, month, day, 10, 0, 0); // Jam 10:00
  // Tanggal selesai adalah 1 sampai 3 hari setelah tanggal mulai
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
  endDate.setHours(22, 0, 0); // Jam 22:00

  return { startDate, endDate };
}

// ... (Array imageUrls, eventNames, dll. tetap sama)
const imageUrls = [
  "https://plus.unsplash.com/premium_photo-1670934158407-d2009128cb02?q=80&w=2060&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1169&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://images.unsplash.com/photo-1590845947670-c009801ffa74?q=80&w=2059&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1074&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://plus.unsplash.com/premium_photo-1680859126181-6f85456f864e?q=80&w=1171&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://plus.unsplash.com/premium_photo-1661962648855-b97a8e025e0e?q=80&w=1632&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1169&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://plus.unsplash.com/premium_photo-1682125748265-d362c809ba04?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://images.unsplash.com/photo-1622107795650-24e72a695404?q=80&w=1173&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://images.unsplash.com/photo-1571470804270-af65e8b3d106?q=80&w=1631&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
  "https://plus.unsplash.com/premium_photo-1686593922853-0b6ba460f2c6?q=80&w=1567&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D",
];
const eventNames = ["Festival Musik Senja", "Pameran Seni Modern", "Bazaar Kuliner Nusantara", "Tech Conference 2025", "Workshop Fotografi Alam", "Konser Amal Peduli Sesama", "Maraton Kemerdekaan", "Pentas Teater Klasik", "Startup Pitching Day", "Pesta Kembang Api Tahun Baru"];
const ticketCategories = ["Regular", "VIP", "Early Bird", "Student Pass"];
const categories = ["MUSIC", "ARTS", "FOOD", "BUSINESS", "DATING"];


async function main() {
  console.log('Start seeding ...');
  
  await prisma.ticketEventCategory.deleteMany();
  await prisma.eventPicture.deleteMany();
  await prisma.event.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  console.log('Old data deleted.');

  const countryData = Country.getAllCountries().map(c => ({ name: c.name, isoCode: c.isoCode }));
  await prisma.country.createMany({ data: countryData, skipDuplicates: true });
  console.log('Countries seeded.');

  const dbCountries = await prisma.country.findMany();
  const countryMap = new Map(dbCountries.map(c => [c.isoCode, c.id]));
  const cityData = City.getAllCities().map(c => ({
    name: c.name,
    countryId: countryMap.get(c.countryCode),
  })).filter(c => c.countryId);
  await prisma.city.createMany({ data: cityData, skipDuplicates: true });
  console.log('Cities seeded.');
  
  const dbCities = await prisma.city.findMany();
  const organizerId = '3b8c5dd9-3d2c-4723-afc0-5595a7f3eec7';

  for (let i = 0; i < 30; i++) {
    const randomCity = getRandomItem(dbCities);
    const eventName = `${getRandomItem(eventNames)} #${i + 1}`;
    const { startDate, endDate } = createRandomDates(); // Gunakan fungsi baru

    const newEvent = await prisma.event.create({
      data: {
        organizerId: organizerId,
        name: eventName,
        slug: slugify(eventName),
        description: `Deskripsi untuk ${eventName}.`,
        category: getRandomItem(categories),
        location: randomCity.name,
        startDate: startDate, // Gunakan tanggal yang sudah valid
        endDate: endDate,     // Gunakan tanggal yang sudah valid
        totalRating: 0,
        countryId: randomCity.countryId,
        cityId: randomCity.id,
      },
    });
    console.log(`Created event: ${newEvent.name}`);

    await prisma.eventPicture.create({
      data: {
        eventId: newEvent.id,
        banner: getRandomItem(imageUrls),
        picture1: getRandomItem(imageUrls),
        picture2: null,
        picture3: null,
      },
    });

    await prisma.ticketEventCategory.create({
      data: {
        eventId: newEvent.id,
        name: "General Admission (Free)",
        description: "Akses masuk gratis.",
        price: 0,
        seatQuota: 1000,
      },
    });
    
    const extraCategories = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < extraCategories; j++) {
      await prisma.ticketEventCategory.create({
        data: {
          eventId: newEvent.id,
          name: getRandomItem(ticketCategories),
          description: "Tiket berbayar.",
          price: (Math.floor(Math.random() * 20) + 5) * 10000,
          seatQuota: Math.floor(Math.random() * 401) + 100,
        },
      });
    }
    console.log(` -> Added pictures and ticket categories for ${newEvent.name}`);
  }

  console.log('Seeding finished.');
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });