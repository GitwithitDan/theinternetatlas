import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()

  const listings = await Listing.find({}, 'slug updatedAt').lean()
  const categories = await Listing.distinct('category')

  const base = 'https://theinternetatlas.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/category/${cat.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}/listing/${l.slug}`,
    lastModified: l.updatedAt ? new Date(l.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes]
}
