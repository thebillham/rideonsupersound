import SignIn from './api/auth/signin'
import { useUser } from '@auth0/nextjs-auth0'
import { useClerk } from 'lib/api/clerk'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Loading from 'components/loading'

export default function IndexPage() {
  const { isLoading } = useUser()
  const { clerk, isClerkLoading } = useClerk()
  const [loading, setLoading] = useState(true)

  // put timeout on loading to avoid going to stop it flashing the "not authenticated" screen
  useEffect(() => {
    if (isLoading || isClerkLoading) setLoading(true)
    else setTimeout(() => setLoading(false), 500)
  }, [isLoading, isClerkLoading])

  const router = useRouter()
  if (clerk?.id) router.push('sell')

  return <>{loading ? <Loading type="pyramid" size="full" /> : <SignIn />}</>
}
