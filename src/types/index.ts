import { Prisma } from '@prisma/client'

// Property with rooms and reviews
export type PropertyWithRooms = Prisma.PropertyGetPayload<{
  include: {
    rooms: true
    reviews: {
      include: {
        user: {
          select: {
            id: true
            name: true
            image: true
          }
        }
      }
    }
    owner: {
      select: {
        id: true
        name: true
      }
    }
  }
}>

// Property card data
export type PropertyCardData = {
  id: string
  name: string
  city: string
  country: string
  images: string[]
  rating: number
  reviewCount: number
  featured: boolean
  minPrice: number
  roomCount: number
}

// Room with property
export type RoomWithProperty = Prisma.RoomGetPayload<{
  include: {
    property: true
  }
}>

// Booking with room and user
export type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    room: {
      include: {
        property: true
      }
    }
    user: {
      select: {
        id: true
        name: true
        email: true
      }
    }
  }
}>

// Review with user
export type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        image: true
      }
    }
  }
}>

// Search filters
export type PropertyFilters = {
  city?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
  amenities?: string[]
  checkIn?: Date
  checkOut?: Date
}

// Booking form data
export type BookingFormData = {
  roomId: string
  checkIn: Date
  checkOut: Date
  guests: number
  specialRequests?: string
}

// API response types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Dashboard stats
export type DashboardStats = {
  totalBookings: number
  totalRevenue: number
  totalUsers: number
  totalProperties: number
  recentBookings: BookingWithDetails[]
  monthlyRevenue: { month: string; revenue: number }[]
}

// User session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
