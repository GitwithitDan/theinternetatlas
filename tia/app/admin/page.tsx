import { isAdminAuthenticated } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import AdminClient from './AdminClient'
import AdminLogin from './AdminLogin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const authed = await isAdminAuthenticated()

  if (!authed) {
    return <AdminLogin />
  }

  await connectDB()
  const listings = await Listing.find({}).sort({ category: 1, name: 1 }).lean()

  return <AdminClient listings={JSON.parse(JSON.stringify(listings))} />
}
