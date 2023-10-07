'use client'
import { useState } from 'react'
import { useAppDispatch } from '@/lib/redux'
import { loginAsync } from '@/lib/redux/slices/session';
import useSession from '@/lib/hooks/useSession';
import Button from '@/components/Button'

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dispatch = useAppDispatch()

  const [isInit] = useSession({
    redirectTo: '/trade',
    redirectIfFound: true
  })

  const handleSubmit = async (e: any) => {
    e.preventDefault(); 
    try {
      await dispatch(loginAsync({ Username: username, Password: password })).unwrap()
    } catch (e) {
      alert(e)
    }
  }

  if (!isInit) return false

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="email" placeholder="email" className="input input-bordered" required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input type="password" placeholder="password" className="input input-bordered" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-control mt-6">
              <Button className="btn-primary">Login</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
