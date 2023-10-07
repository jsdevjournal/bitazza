import {
  createSelector,
  createAction,
  createSlice,
  PayloadAction,
  createAsyncThunk,
  isAnyOf
} from '@reduxjs/toolkit'
import btzsocket, { type SocketListener, SocketResponse } from '@/lib/socket'
import { sub } from 'date-fns'

export enum PriceHistoryPeriod {
  D = 'D',
  W = 'W',
  M = 'M',
}

export type PriceHistory = {
  DateTime: number,
  High: number,
  Low: number,
  Open: number,
  Close: number,
  Volume: number,
  InsideBidPrice: number,
  InsideAskPrice: number,
  InstrumentId: number
}

export type Instrument = SocketResponse['GetInstruments'][number]

export type ComputedInstrument = Instrument & {
  Prices: PriceHistory[]
}

export const getInstrumentsAsync = createAsyncThunk(
  'trades/getInstrumentsAsync',
  async () => {
    const response = await btzsocket.getInstance().sendPromise('GetInstruments', { OMSId: 1 })
    return response
  }
)

export const getInstruments = () => {
  btzsocket.getInstance().send('GetInstruments', { OMSId: 1 });
}

export const getPriceHistory = (InstrumentId: number) => {
  let FromDate = sub(new Date(), { months: 1, days: 1 })
  btzsocket.getInstance().send('GetTickerHistory', {
    InstrumentId,
    Interval: 60*60*24,
    FromDate: FromDate.toISOString().split('T')[0],
    ToDate: new Date().toISOString().split('T')[0],
    OMSId: 1
  });
}

export const gotInstruments = createAction<SocketResponse['GetInstruments']>('trades/gotInstruments')

export const convertPriceHistory = (array: number[]): PriceHistory => ({
  DateTime: array[0],
  High: array[1],
  Low: array[2],
  Open: array[3],
  Close: array[4],
  Volume: array[5],
  InsideBidPrice: array[6],
  InsideAskPrice: array[7],
  InstrumentId: array[8]
})

export type TradeState = {
  computed: Record<ComputedInstrument['InstrumentId'], ComputedInstrument>
}

const initialState = {
  computed: {}
} as TradeState

export const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    gotHistory: ({ computed }: TradeState, action: PayloadAction<SocketResponse['GetTickerHistory']>) => {
      const val = action.payload.map(convertPriceHistory)
      if (val.length) {
        const { InstrumentId } = val[0]
        if (computed[InstrumentId]) {
          computed[InstrumentId].Prices = val.sort((a, b) => b.DateTime - a.DateTime)
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(getInstrumentsAsync.fulfilled, gotInstruments),
      ({ computed }: TradeState, action: PayloadAction<SocketResponse['GetInstruments']>) => {
        for (let val of action.payload) {
          const { InstrumentId } = val
          if (!computed[InstrumentId]) {
            computed[InstrumentId] = Object.assign({ Prices: [] }, val)
          }
        }
      }
    )
  },
})

const listener: SocketListener = {
  onMessage(e, store) {
    if (e.n === 'GetInstruments') {
      const vals = e.o as SocketResponse['GetInstruments']
      store?.dispatch(gotInstruments(vals))
    }
    if (e.n === 'GetTickerHistory') {
      store?.dispatch(gotHistory(e.o as SocketResponse['GetTickerHistory']))
    }
  }
}

btzsocket.getInstance().addListener(listener)

export const { gotHistory } = tradeSlice.actions

export type SelectComputedTrade = {
  Symbol: string,
  InstrumentId: number,
  Close: number,
  Change: number,
  ChangePercent: number
}

export const selectComputed = (state: { trade: TradeState }) => state.trade.computed

export const selectPair = (search: string, period: PriceHistoryPeriod) => createSelector(selectComputed, computed => {
  let lookbackIndex = 1
  if (period === PriceHistoryPeriod.D) {
    lookbackIndex = 1
  } else if (period === PriceHistoryPeriod.W) {
    lookbackIndex = 7
  } else if (period === PriceHistoryPeriod.M) {
    lookbackIndex = 30
  }
  search = search.toUpperCase()
  return Object.values(computed)
    .filter(val => val.Symbol.includes(search) && val.Prices.length)
    .map(val => {
      const { Prices, Symbol, InstrumentId } = val
      const Close = Prices[0].Close
      const Change = Close - Prices[lookbackIndex]?.Close
      const ChangePercent = ((Close / Prices[lookbackIndex]?.Close) * 100) - 100
      return {
        Symbol,
        InstrumentId,
        Close,
        Change,
        ChangePercent
      }
    })
    .sort((a, b) => b.ChangePercent - a.ChangePercent)
})
