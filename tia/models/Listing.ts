import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IListing extends Document {
  name: string
  url: string
  slug: string
  category: string
  subcategory?: string
  description: string
  best_for?: string
  pricing: 'free' | 'freemium' | 'paid'
  type: 'website' | 'software'
  platforms: string[]
  learning_curve?: 'beginner' | 'intermediate' | 'advanced'
  alternatives?: string[]
  tags: string[]
  featured: boolean
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

const ListingSchema = new Schema<IListing>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    best_for: { type: String, trim: true },
    pricing: { type: String, enum: ['free', 'freemium', 'paid'], required: true },
    type: { type: String, enum: ['website', 'software'], required: true },
    platforms: [{ type: String }],
    learning_curve: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    alternatives: [{ type: String }],
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

ListingSchema.index({ name: 'text', description: 'text', tags: 'text' })
ListingSchema.index({ category: 1 })
ListingSchema.index({ slug: 1 })
ListingSchema.index({ pricing: 1 })
ListingSchema.index({ type: 1 })

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

ListingSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = makeSlug(this.name)
  }
  next()
})

export { makeSlug }

const Listing: Model<IListing> =
  mongoose.models.Listing ?? mongoose.model<IListing>('Listing', ListingSchema)

export default Listing
