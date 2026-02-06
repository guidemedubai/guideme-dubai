import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@guideme.com' },
    update: {},
    create: {
      email: 'admin@guideme.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  // Create property owner
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@guideme.com' },
    update: {},
    create: {
      email: 'owner@guideme.com',
      password: ownerPassword,
      name: 'Hotel Owner',
      role: 'owner',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@guideme.com' },
    update: {},
    create: {
      email: 'user@guideme.com',
      password: userPassword,
      name: 'John Doe',
      role: 'user',
    },
  })

  // Create properties
  const properties = [
    {
      name: 'Burj Al Arab Jumeirah',
      description: 'Experience unparalleled luxury at the iconic sail-shaped hotel. Features world-class dining, private beach, and stunning views of the Arabian Gulf.',
      address: 'Jumeirah Beach Road',
      city: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.1412,
      longitude: 55.1853,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      ]),
      amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'Beach Access', 'Gym', 'WiFi', 'Parking', 'Room Service']),
      rating: 4.9,
      reviewCount: 1250,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'Atlantis The Palm',
      description: 'Discover a world of wonder at this ocean-themed resort on Palm Jumeirah. Features Aquaventure Waterpark and The Lost Chambers Aquarium.',
      address: 'Crescent Road, The Palm',
      city: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.1304,
      longitude: 55.1171,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ]),
      amenities: JSON.stringify(['Pool', 'Waterpark', 'Aquarium', 'Restaurant', 'Spa', 'Beach', 'WiFi', 'Kids Club']),
      rating: 4.7,
      reviewCount: 3420,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'JW Marriott Marquis',
      description: 'One of the tallest hotels in the world, offering stunning city views and premium amenities in the heart of Business Bay.',
      address: 'Business Bay',
      city: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.1867,
      longitude: 55.2689,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      ]),
      amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'WiFi', 'Business Center', 'Concierge']),
      rating: 4.6,
      reviewCount: 2100,
      featured: false,
      ownerId: owner.id,
    },
    {
      name: 'Address Downtown',
      description: 'Luxury hotel in Downtown Dubai with direct access to Dubai Mall and stunning Burj Khalifa views.',
      address: 'Mohammed Bin Rashid Boulevard',
      city: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.1972,
      longitude: 55.2744,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
      ]),
      amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'Mall Access', 'Gym', 'WiFi', 'Valet Parking']),
      rating: 4.8,
      reviewCount: 1890,
      featured: true,
      ownerId: owner.id,
    },
    {
      name: 'Rove Downtown',
      description: 'Modern and affordable hotel perfect for urban explorers. Walking distance to Dubai Mall and Burj Khalifa.',
      address: 'Al Mustaqbal Street',
      city: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.1915,
      longitude: 55.2678,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      ]),
      amenities: JSON.stringify(['Pool', 'Gym', 'Restaurant', 'WiFi', 'Laundry', 'Bike Rental']),
      rating: 4.3,
      reviewCount: 945,
      featured: false,
      ownerId: owner.id,
    },
    {
      name: 'Jumeirah Beach Hotel',
      description: 'Wave-shaped beachfront resort offering exclusive beach access and proximity to Wild Wadi Waterpark.',
      address: 'Jumeirah Beach Road',
      city: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.1418,
      longitude: 55.1884,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      ]),
      amenities: JSON.stringify(['Beach', 'Pool', 'Waterpark', 'Spa', 'Restaurant', 'WiFi', 'Kids Club', 'Tennis']),
      rating: 4.5,
      reviewCount: 2340,
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
        description: 'Comfortable room with essential amenities for a pleasant stay.',
        type: 'single',
        capacity: 2,
        price: 250,
        images: JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800']),
        amenities: JSON.stringify(['King Bed', 'WiFi', 'TV', 'Mini Bar', 'Safe']),
        propertyId: property.id,
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious room with premium amenities and city views.',
        type: 'double',
        capacity: 3,
        price: 450,
        images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800']),
        amenities: JSON.stringify(['King Bed', 'WiFi', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Bathtub']),
        propertyId: property.id,
      },
      {
        name: 'Executive Suite',
        description: 'Luxurious suite with separate living area and panoramic views.',
        type: 'suite',
        capacity: 4,
        price: 850,
        images: JSON.stringify(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800']),
        amenities: JSON.stringify(['King Bed', 'Living Room', 'WiFi', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Jacuzzi']),
        propertyId: property.id,
      },
      {
        name: 'Presidential Suite',
        description: 'Ultimate luxury with butler service and exclusive amenities.',
        type: 'deluxe',
        capacity: 6,
        price: 2500,
        images: JSON.stringify(['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800']),
        amenities: JSON.stringify(['Master Bedroom', 'Living Room', 'Dining Room', 'Private Pool', 'Butler Service', 'Helipad Access']),
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
        checkIn: new Date('2026-03-01'),
        checkOut: new Date('2026-03-05'),
        guests: 2,
        totalPrice: 1000,
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
        title: 'Amazing Experience!',
        comment: 'The hotel exceeded all expectations. Beautiful rooms, excellent service, and stunning views. Will definitely come back!',
        userId: user.id,
        propertyId: firstProperty.id,
      },
    })
  }

  console.log('Database seeded successfully!')
  console.log('Test accounts:')
  console.log('- Admin: admin@guideme.com / admin123')
  console.log('- Owner: owner@guideme.com / owner123')
  console.log('- User: user@guideme.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
