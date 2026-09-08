import type { Metadata } from 'next'
import { ProfileView } from './profile-view'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your account details.',
}

export default function ProfilePage() {
  return <ProfileView />
}
