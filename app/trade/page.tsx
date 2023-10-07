'use client'
import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch } from '@/lib/redux'
import { useSelector } from 'react-redux'
import { logOut } from '@/lib/redux/slices/session'
import { getPriceHistory, selectTrade, PriceHistoryPeriod, getInstrumentsAsync } from '@/lib/redux/slices/trade'
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

  const { instruments, prices } = useSelector(selectTrade)

  useEffect(() => {
    (async () => {
      const res = await dispatch(getInstrumentsAsync()).unwrap()
      res.forEach(val => getPriceHistory(val.InstrumentId))
    })()
  }, [])

  const pairs = useMemo(() => {
    let lookbackIndex = 1
    if (period === PriceHistoryPeriod.D) {
      lookbackIndex = 1
    } else if (period === PriceHistoryPeriod.W) {
      lookbackIndex = 7
    } else if (period === PriceHistoryPeriod.M) {
      lookbackIndex = 30
    }
    return Object.values(instruments)
      .filter(val => val?.Symbol.includes(search.toUpperCase()))
      .map(val => {
        const Prices = prices[val.InstrumentId] || []
        const Close = Prices[0]?.Close
        const Change = Close - Prices[lookbackIndex]?.Close
        const ChangePercent = ((Close / Prices[lookbackIndex]?.Close) * 100) - 100
        return {
          ...val,
          Meta: { Prices, Close, Change, ChangePercent }
        }
      })
      .filter(val => !!val.Meta.Close)
      .sort((a, b) => b.Meta.ChangePercent - a.Meta.ChangePercent)
  }, [instruments, prices, search, period])

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