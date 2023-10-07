'use client'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/lib/redux'
import { useSelector } from 'react-redux'
import { logOut } from '@/lib/redux/slices/session'
import {
  getPriceHistory,
  selectTrade,
  PriceHistoryPeriod,
  getInstrumentsAsync
} from '@/lib/redux/slices/trade'
import useSession from '@/lib/hooks/useSession'
import Button from '@/components/Button'
import Layout from '@/components/Layout'
import InstrumentTable from '@/components/InstrumentTable'

export default function Page() {
  const [search, setSearch] = useState<string>('')
  const [period, setPeriod] = useState<PriceHistoryPeriod>(PriceHistoryPeriod.D)
  const dispatch = useAppDispatch()

  const [isInit, user] = useSession({
    redirectTo: '/',
  })

  const pairs = useSelector(selectTrade(search, period))

  useEffect(() => {
    (async () => {
      const res = await dispatch(getInstrumentsAsync()).unwrap()
      res.forEach(val => getPriceHistory(val.InstrumentId))
    })()
  }, [])

  if (!isInit || !user) return false

  const gainers = pairs.slice(0, 5)
  const losers = pairs.slice(-5)

  return (
    <Layout>
      <Button
        onClick={logOut}
        className="absolute top-0 right-0 m-1"
      >
        Logout
      </Button>
      <div className="join">
        <div>
          <div>
            <input className="input input-bordered join-item" placeholder="Search" onChange={(e) => setSearch(e.target.value)}/>
          </div>
        </div>
        <select className="select select-bordered join-item" defaultValue={period} onChange={(e) => setPeriod(e.target.value as PriceHistoryPeriod)}>
          <option disabled>Period</option>
          <option value={PriceHistoryPeriod.D}>1 Day</option>
          <option value={PriceHistoryPeriod.W}>7 Days</option>
          <option value={PriceHistoryPeriod.M}>30 Days</option>
        </select>
      </div>
      <InstrumentTable
        title="Top Gainers"
        list={gainers}
      />
      <InstrumentTable
        title="Top Losers"
        list={losers.reverse()}
      />
    </Layout>
  )
}