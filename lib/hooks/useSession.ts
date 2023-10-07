import { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { selectUser, selectIsInit } from '@/lib/redux/slices/session'

export default function useSession({
  redirectTo = '',
  redirectIfFound = false,
}) {
  const router = useRouter()
  const user = useSelector(selectUser)
  const isInit = useSelector(selectIsInit)

  useEffect(() => {
    if (isInit) {
      if (
        // If redirectTo is set, redirect if the user was not found.
        (redirectTo && !redirectIfFound && !user) ||
        // If redirectIfFound is also set, redirect if the user was found
        (redirectIfFound && user)
      ) {
        router.replace(redirectTo)
      }
    }
  }, [redirectIfFound, redirectTo, isInit, user])

  return [isInit, user];
}