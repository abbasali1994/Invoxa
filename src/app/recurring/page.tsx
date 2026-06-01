'use client'
import { redirect } from 'next/navigation'

export default function RecurringRedirectPage() {
  redirect('/settings?tab=Scheduler')
}
