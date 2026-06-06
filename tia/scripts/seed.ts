import mongoose from 'mongoose'
import * as fs from 'fs'
import * as path from 'path'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.')
  console.error('Run: MONGODB_URI="your-connection-string" npm run seed')
  process.exit(1)
}

interface SeedEntry {
  name: string
  url: string
  category: string
  subcategory?: string
  description: string
  best_for?: string
  pricing: string
  type: string
  platforms?: string[]
  learning_curve?: string
  alternatives?: string[]
  tags?: string[]
}

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const ListingSchema = new mongoose.Schema({
  name: String,
  url: String,
  slug: { type: String, unique: true },
  category: String,
  subcategory: String,
  description: String,
  best_for: String,
  pricing: String,
  type: String,
  platforms: [String],
  learning_curve: String,
  alternatives: [String],
  tags: [String],
  featured: { type: Boolean, default: false },
  verified: { type: Boolean, default: true },
}, { timestamps: true })

const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema)

async function seed() {
  console.log('Connecting to MongoDB…')
  await mongoose.connect(MONGODB_URI as string)
  console.log('Connected.')

  const dataPath = path.join(__dirname, '..', '..', 'tia-seed-data.json')

  if (!fs.existsSync(dataPath)) {
    console.error(`Seed file not found at: ${dataPath}`)
    console.error('Place tia-seed-data.json in the project root.')
    process.exit(1)
  }

  const raw = fs.readFileSync(dataPath, 'utf-8')
  const entries: SeedEntry[] = JSON.parse(raw)

  console.log(`Found ${entries.length} entries. Inserting…`)

  let inserted = 0
  let skipped = 0

  for (const entry of entries) {
    const slug = makeSlug(entry.name)
    const existing = await Listing.findOne({ slug })
    if (existing) {
      skipped++
      continue
    }
    await Listing.create({ ...entry, slug })
    inserted++
  }

  console.log(`Done. ${inserted} inserted, ${skipped} skipped (already exist).`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
