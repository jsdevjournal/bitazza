'use client'
import React from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider, useDispatch } from 'react-redux'
import { sessionSlice, tradeSlice } from './slices'
import logger from 'redux-logger'
import btzsocket from '@/lib/socket'

const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    trade: tradeSlice.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

btzsocket.getInstance().addStore(store)

const ReduxProvider = (props: React.PropsWithChildren) => {
  return <Provider store={store}>{props.children}</Provider>
}

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch // 

export default ReduxProvider
