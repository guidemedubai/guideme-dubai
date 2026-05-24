import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@doletz.com' },
    update: {},
    create: {
      email: 'admin@doletz.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  // Create property owner
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@doletz.com' },
    update: {},
    create: {
      email: 'owner@doletz.com',
      password: ownerPassword,
      name: 'Island Resorts Maldives',
      role: 'owner',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@doletz.com' },
    update: {},
    create: {
      email: 'user@doletz.com',
      password: userPassword,
      name: 'Sarah Johnson',
      role: 'user',
    },
  })

  // Create properties
  const properties = [
    {
      name: 'Kaani Beach Hotel',
      description: 'A charming beachfront guesthouse on Maafushi Island offering affordable luxury with white sandy beaches, crystal-clear lagoons, and authentic Maldivian hospitality just steps from the bikini beach.',
      address: 'Maafushi Island',
      city: 'Maafushi',
      country: 'Maldives',
      latitude: 3.9433,
      longitude: 73.4906,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800',
      ]),
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Diving Center', 'Snorkeling Gear', 'Restaurant', 'Water Sports', 'Airport Transfer', 'Air Conditioning']),
      rating: 4.7,
      reviewCount: 890,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'Arena Beach Hotel',
      description: 'A popular beachfront guesthouse on Maafushi with direct beach access, stunning ocean views, and easy access to diving sites and sandbanks. Perfect for budget-conscious travelers seeking paradise.',
      address: 'Beach Road, Maafushi',
      city: 'Maafushi',
      country: 'Maldives',
      latitude: 3.9420,
      longitude: 73.4900,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
        'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
      ]),
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Snorkeling Gear', 'Restaurant', 'Water Sports', 'Kayaks', 'Airport Transfer', 'Rooftop Terrace']),
      rating: 4.5,
      reviewCount: 1120,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'Cinnamon Dhonveli',
      description: 'A premier surf and diving resort in North Male Atoll surrounded by pristine reefs. Features an exclusive surf point, overwater dining, and direct access to some of the best dive sites in the Maldives.',
      address: 'North Male Atoll',
      city: 'North Male Atoll',
      country: 'Maldives',
      latitude: 4.2667,
      longitude: 73.4833,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
        'https://images.unsplash.com/photo-1559628233-100c798642d4?w=800',
      ]),
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Diving Center', 'Spa', 'Restaurant', 'Water Sports', 'Surfing', 'Airport Transfer', 'Pool']),
      rating: 4.8,
      reviewCount: 1560,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'Reethi Beach Resort',
      description: 'A luxury eco-resort in the UNESCO Biosphere Reserve of Baa Atoll. Surrounded by vibrant coral reefs and home to manta ray feeding stations, offering an unforgettable barefoot luxury experience.',
      address: 'Fonimagoodhoo Island, Baa Atoll',
      city: 'Baa Atoll',
      country: 'Maldives',
      latitude: 5.2849,
      longitude: 72.9853,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800',
        'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=800',
      ]),
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Diving Center', 'Spa', 'Restaurant', 'Water Sports', 'Pool', 'Airport Transfer', 'Yoga']),
      rating: 4.9,
      reviewCount: 2100,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'Thulusdhoo Island Retreat',
      description: 'A laid-back surf guesthouse on Thulusdhoo Island, famous for the legendary "Cokes" surf break. Perfect for surfers, divers, and travelers seeking an authentic local island experience.',
      address: 'Thulusdhoo Island',
      city: 'Thulusdhoo',
      country: 'Maldives',
      latitude: 4.3747,
      longitude: 73.6478,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      ]),
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Surfboard Rental', 'Snorkeling Gear', 'Restaurant', 'Airport Transfer', 'Bicycle Rental']),
      rating: 4.4,
      reviewCount: 640,
      featured: false,
      ownerId: owner.id,
    },
    {
      name: 'Equator Village',
      description: 'A heritage hotel in the southernmost atoll of Maldives, built on the site of a former British RAF base. Offers a unique blend of history, culture, and natural beauty with lush tropical gardens.',
      address: 'Gan Island, Addu City',
      city: 'Addu City',
      country: 'Maldives',
      latitude: -0.6273,
      longitude: 73.1588,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
      ]),
      amenities: JSON.stringify(['Beach Access', 'WiFi', 'Diving Center', 'Restaurant', 'Pool', 'Spa', 'Airport Transfer', 'Garden', 'Heritage Tours']),
      rating: 4.3,
      reviewCount: 480,
      featured: false,
      ownerId: owner.id,
    },
  ]

  for (const propertyData of properties) {
    const property = await prisma.property.create({
      data: propertyData,
    })

    // Create rooms for each property
    const rooms = [
      {
        name: 'Standard Room',
        description: 'Comfortable air-conditioned room with ocean-inspired decor, modern amenities, and views of the tropical garden or island streets.',
        type: 'single',
        capacity: 2,
        price: 80,
        images: JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800']),
        amenities: JSON.stringify(['Queen Bed', 'WiFi', 'TV', 'Air Conditioning', 'Safe', 'Mini Fridge']),
        propertyId: property.id,
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious room with premium furnishings, private balcony, and partial ocean views. Includes complimentary snorkeling gear.',
        type: 'double',
        capacity: 3,
        price: 150,
        images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800']),
        amenities: JSON.stringify(['King Bed', 'WiFi', 'TV', 'Air Conditioning', 'Safe', 'Balcony', 'Rain Shower', 'Snorkeling Gear']),
        propertyId: property.id,
      },
      {
        name: 'Beach Villa',
        description: 'Private beachfront villa with direct sand access, outdoor shower, sun loungers, and unobstructed sunset views over the Indian Ocean.',
        type: 'suite',
        capacity: 4,
        price: 280,
        images: JSON.stringify(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800']),
        amenities: JSON.stringify(['King Bed', 'Living Area', 'WiFi', 'TV', 'Air Conditioning', 'Private Beach Access', 'Outdoor Shower', 'Sun Deck']),
        propertyId: property.id,
      },
      {
        name: 'Water Bungalow',
        description: 'Iconic overwater bungalow with glass floor panels, private deck with direct lagoon access, and panoramic ocean views from every angle.',
        type: 'deluxe',
        capacity: 2,
        price: 450,
        images: JSON.stringify(['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800']),
        amenities: JSON.stringify(['King Bed', 'Glass Floor', 'WiFi', 'TV', 'Air Conditioning', 'Private Deck', 'Lagoon Access', 'Outdoor Bathtub', 'Sunset Views']),
        propertyId: property.id,
      },
    ]

    for (const roomData of rooms) {
      await prisma.room.create({
        data: roomData,
      })
    }
  }

  // Create a sample booking
  const firstProperty = await prisma.property.findFirst({
    include: { rooms: true },
  })

  if (firstProperty && firstProperty.rooms.length > 0) {
    await prisma.booking.create({
      data: {
        checkIn: new Date('2026-06-01'),
        checkOut: new Date('2026-06-05'),
        guests: 2,
        totalPrice: 600,
        status: 'confirmed',
        paymentStatus: 'paid',
        userId: user.id,
        roomId: firstProperty.rooms[0].id,
      },
    })

    // Create a review
    await prisma.review.create({
      data: {
        rating: 5,
        title: 'Paradise Found!',
        comment: 'Absolutely stunning island experience. The crystal-clear waters, pristine beaches, and warm hospitality made this trip unforgettable. Snorkeling right off the beach was incredible!',
        userId: user.id,
        propertyId: firstProperty.id,
      },
    })
  }

  // Create seller user
  const sellerPassword = await bcrypt.hash('seller123', 10)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@doletz.com' },
    update: {},
    create: {
      email: 'seller@doletz.com',
      password: sellerPassword,
      name: 'Maldives Adventures Co.',
      role: 'seller',
      company: 'Maldives Adventures Co.',
      licenseNumber: 'MA-2024-001',
      phone: '+9607781234',
      bio: 'Premier activity operator in the Maldives offering snorkeling safaris, diving courses, island hopping, and authentic cultural experiences.',
    },
  })

  // Create agent user
  const agentPassword = await bcrypt.hash('agent123', 10)
  await prisma.user.upsert({
    where: { email: 'agent@doletz.com' },
    update: {},
    create: {
      email: 'agent@doletz.com',
      password: agentPassword,
      name: 'Island Travel Agency',
      role: 'agent',
      company: 'Island Travel Agency',
      licenseNumber: 'ITA-2024-001',
      phone: '+9607789876',
      bio: 'Expert travel agency specializing in Maldives luxury resort packages and local island experiences.',
    },
  })

  // Create activities
  const activities = [
    {
      name: 'Snorkeling Safari',
      description: 'Explore vibrant coral reefs and swim alongside sea turtles, reef sharks, and colorful tropical fish on a guided snorkeling safari across multiple pristine sites.',
      category: 'water-sports',
      address: 'Maafushi Lagoon',
      city: 'Maafushi',
      country: 'Maldives',
      latitude: 3.9433,
      longitude: 73.4906,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
      ]),
      duration: '3 hours',
      price: 45,
      rating: 4.8,
      reviewCount: 1850,
      featured: true,
      tags: JSON.stringify(['snorkeling', 'marine-life', 'coral-reef', 'tropical-fish']),
      ownerId: seller.id,
    },
    {
      name: 'Scuba Diving Course',
      description: 'Discover the underwater world with a PADI-certified diving course. Dive alongside manta rays, whale sharks, and explore stunning coral walls in crystal-clear waters.',
      category: 'adventure',
      address: 'North Male Atoll Dive Sites',
      city: 'North Male Atoll',
      country: 'Maldives',
      latitude: 4.2667,
      longitude: 73.4833,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544551763-77932f16a4e6?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      ]),
      duration: '4 hours',
      price: 120,
      rating: 4.9,
      reviewCount: 1240,
      featured: true,
      tags: JSON.stringify(['diving', 'PADI', 'manta-rays', 'underwater']),
      ownerId: seller.id,
    },
    {
      name: 'Dolphin Watching Cruise',
      description: 'Set sail at golden hour to witness pods of spinner dolphins leaping and playing in the warm waters of Ari Atoll. A magical experience for all ages.',
      category: 'adventure',
      address: 'Ari Atoll Waters',
      city: 'Ari Atoll',
      country: 'Maldives',
      latitude: 3.8567,
      longitude: 72.8561,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=800',
        'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800',
      ]),
      duration: '2 hours',
      price: 55,
      rating: 4.7,
      reviewCount: 980,
      featured: true,
      tags: JSON.stringify(['dolphins', 'cruise', 'sunset', 'wildlife']),
      ownerId: seller.id,
    },
    {
      name: 'Local Island Hopping',
      description: 'Visit multiple local islands to experience authentic Maldivian culture, taste traditional cuisine, explore fishing villages, and relax on untouched sandbanks.',
      category: 'cultural',
      address: 'Male Ferry Terminal',
      city: 'Male',
      country: 'Maldives',
      latitude: 4.1755,
      longitude: 73.5093,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
        'https://images.unsplash.com/photo-1505881502353-a1986add3762?w=800',
      ]),
      duration: '6 hours',
      price: 85,
      rating: 4.6,
      reviewCount: 760,
      featured: true,
      tags: JSON.stringify(['island-hopping', 'culture', 'local-life', 'sandbank']),
      ownerId: seller.id,
    },
    {
      name: 'Sunset Fishing Trip',
      description: 'Experience traditional Maldivian line fishing at sunset. Learn local techniques, enjoy the golden hour over the ocean, and have your catch prepared for dinner.',
      category: 'adventure',
      address: 'Maafushi Harbor',
      city: 'Maafushi',
      country: 'Maldives',
      latitude: 3.9433,
      longitude: 73.4906,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=800',
        'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800',
      ]),
      duration: '3 hours',
      price: 40,
      rating: 4.5,
      reviewCount: 620,
      featured: false,
      tags: JSON.stringify(['fishing', 'sunset', 'traditional', 'dinner']),
      ownerId: seller.id,
    },
    {
      name: 'Maldivian Cooking Class',
      description: 'Learn to prepare authentic Maldivian dishes including mas huni, garudhiya, and Maldivian curry using fresh local ingredients. Enjoy your creations with ocean views.',
      category: 'dining',
      address: 'Maafushi Local Kitchen',
      city: 'Maafushi',
      country: 'Maldives',
      latitude: 3.9433,
      longitude: 73.4906,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      ]),
      duration: '2 hours',
      price: 35,
      rating: 4.4,
      reviewCount: 340,
      featured: false,
      tags: JSON.stringify(['cooking', 'cuisine', 'local-food', 'cultural']),
      ownerId: seller.id,
    },
    {
      name: 'Surfing at Thulusdhoo',
      description: 'Ride the legendary "Cokes" break at Thulusdhoo — one of the best surf spots in the Maldives. Suitable for intermediate to advanced surfers with board rental included.',
      category: 'water-sports',
      address: 'Cokes Surf Point, Thulusdhoo',
      city: 'Thulusdhoo',
      country: 'Maldives',
      latitude: 4.3747,
      longitude: 73.6478,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502680390049-dc4466e31f6e?w=800',
        'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=800',
      ]),
      duration: '3 hours',
      price: 60,
      rating: 4.7,
      reviewCount: 510,
      featured: false,
      tags: JSON.stringify(['surfing', 'waves', 'board-rental', 'adventure']),
      ownerId: seller.id,
    },
    {
      name: 'Bioluminescent Beach Night Tour',
      description: 'Witness the magical blue glow of bioluminescent plankton illuminating the shoreline of Vaadhoo Island. A once-in-a-lifetime natural phenomenon best seen on moonless nights.',
      category: 'cultural',
      address: 'Vaadhoo Island Beach',
      city: 'Vaadhoo',
      country: 'Maldives',
      latitude: 0.1947,
      longitude: 73.0019,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800',
        'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
      ]),
      duration: '2 hours',
      price: 50,
      rating: 4.8,
      reviewCount: 890,
      featured: false,
      tags: JSON.stringify(['bioluminescence', 'night-tour', 'nature', 'photography']),
      ownerId: seller.id,
    },
  ]

  for (const activityData of activities) {
    await prisma.activity.create({ data: activityData })
  }

  console.log('Database seeded successfully!')
  console.log('Test accounts:')
  console.log('- Admin: admin@doletz.com / admin123')
  console.log('- Owner: owner@doletz.com / owner123')
  console.log('- Seller: seller@doletz.com / seller123')
  console.log('- Agent: agent@doletz.com / agent123')
  console.log('- User: user@doletz.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
