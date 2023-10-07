import { createAction, createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
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

type State = {
  instruments: Record<Instrument['InstrumentId'], Instrument>,
  prices: Record<PriceHistory['InstrumentId'], PriceHistory[]>
}

const initialState = {
  instruments: {},
  prices: {}
} as State

export const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    gotHistory: (state: State, action: PayloadAction<SocketResponse['GetTickerHistory']>) => {
      const val = action.payload.map(convertPriceHistory)
      if (val.length) {
        state.prices[val[0].InstrumentId] = val.sort((a, b) => b.DateTime - a.DateTime)
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => [getInstrumentsAsync.fulfilled, gotInstruments.type].includes(action.type),
      (state, action: PayloadAction<SocketResponse['GetInstruments']>) => {
        for (let val of action.payload) {
          state.instruments[val.InstrumentId] = val
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

export const selectTrade = (state: { trade: State }) => state.trade
