// Root / is handled by middleware which redirects to /en or /it
// This is a fallback only
import { redirect } from 'next/navigation'
export default function RootPage() {
  redirect('/en')
}
