import { cookies } from 'next/headers'

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('tia_admin')
  return token?.value === process.env.ADMIN_SECRET
}
