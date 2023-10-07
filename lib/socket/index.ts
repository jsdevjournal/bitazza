import { type Store } from '@reduxjs/toolkit'

export type SocketRequest = {
  GetTickerHistory: {
    InstrumentId: number,
    Interval: number,
    FromDate: string,
    ToDate: string,
    OMSId: number
  },
  LogOut?: Object,
  AuthenticateUser: {
    Username: string,
    Password: string
  },
  GetInstruments: {
    OMSId: number,
  }
}

export type SocketResponse = {
  GetTickerHistory: Array<[
    number,  // DateTime - UTC - Milliseconds since 1/1/1970 - POSIX format
    number,  // High
    number,  // Low
    number,  // Open
    number,  // Close
    number,  // Volume
    number,  // Inside Bid Price
    number,  // Inside Ask Price
    number   // InstrumentId
  ]>,
  LogOut: {
    Result: boolean,
    Errormsg?: string,
    Errorcode: number,
    Detail?: string
  },
  AuthenticateUser: {
    Authenticated: boolean,
    User: {
      UserId: number,
      UserName: string,
      Email: string,
      EmailVerified: boolean,
      AccountId: number,
      OmsId: number,
      Use2FA: boolean
    },
    Locked: boolean,
    Requires2FA: boolean,
    TwoFAType: string,
    TwoFAToken: string,
    errormsg: string
  },
  GetInstruments: Array<{
    OmsId: number,
    InstrumentId: number,
    Symbol: string,
    Product1: number,
    Product1Symbol: string,
    Product2: number,
    Product2Symbol: string,
    InstrumentType: number,
    VenueInstrumentId: string,
    VenueId: number,
    SortIndex: number,
    SessionStatus: number,
    PreviousSessionStatus: number,
    SessionStatusDateTime: Date,
    SelfTradePrevention: boolean,
    QuantityIncrement: number,
    PriceIncrement: number
  }>
}

type Frame<T extends string | object> = {
  i: number,
  m: number;
  n: keyof SocketResponse;
  o: T;
};

export type SocketListener = {
  onOpen?(store?: Store): void
  onMessage?(e: Frame<Object>, store?: Store): void
}

export interface ISocket {
  _onClose: (event: CloseEvent) => void
  _onError: (event: Event) => void
  _onOpen: (event: Event) => void
  _onMessage: (event: MessageEvent) => void
}

type BTZSocketConfig = {
  url: string
}

let instance: BTZSocket

class BTZSocket implements ISocket {

  identifier: number = 2
  wm = new Map()
  socket: WebSocket
  listeners: SocketListener[]
  store?: Store
  ready: boolean = false
  queue: Array<any> = []

  constructor(config: BTZSocketConfig) {
    const socket = this.socket = new WebSocket(config.url)
    socket.onopen = this._onOpen
    socket.onmessage = this._onMessage
    socket.onerror = this._onError
    socket.onclose = this._onClose
    this.listeners = []
  }

  static getInstance = () => {
    if (!instance) {
      instance = new BTZSocket({
        url: 'wss://apexapi.bitazza.com/WSGateway'
      })      
    }
    return instance
  }

  addStore = (store: Store) => {
    this.store = store;
  }

  _onClose = (_event: CloseEvent) => {
    console.log('onclose')
  }

  _onError = (_event: Event) => {
    console.log('onerror')
  }

  _onOpen = (_event: Event) => {
    this.ready = true
    this._emit('onOpen')
    for (let q of this.queue) {
      this.socket.send(q)
    }
    this.queue.length = 0
  }

  _onMessage = (event: MessageEvent) => {
    console.log('onmessage')
    const frame: Frame<string> = JSON.parse(event.data)

    if (frame.m === 1) {
      const data = {
        ...frame,
        o: JSON.parse(frame.o)
      }

      const identifier = frame.i
      const resolver = this.wm.get(identifier)
      if (resolver) {
        resolver(data.o)
        this.wm.delete(identifier)
      } else {
        this._emit('onMessage', data)
      }
    }
  }

  _emit = (k: keyof SocketListener, data?: any) => {
    const { listeners, store } = this
    for (let listener of listeners) {
      if (k === 'onOpen') {
        listener.onOpen?.call(this, store)
      }
      if (k === 'onMessage') {
        listener.onMessage?.call(this, data, store)
      }
    }
  }

  addListener = (listener: SocketListener) => {
    this.listeners.push(listener)
  }

  removeListener = (listener: SocketListener) => {
    this.listeners = this.listeners.filter(val => val != listener)
  }

  send = <A extends keyof SocketRequest>(topic: A, payload?: SocketRequest[A]) => {
    const data = JSON.stringify({
      m: 0,
      i: 1,
      n: topic,
      o: JSON.stringify(payload || {})
    });
    if (this.ready) {
      this.socket.send(data)
    } else {
      this.queue.push(data)
    }
  }

  sendPromise = <A extends keyof SocketRequest>(topic: A, payload?: SocketRequest[A]): Promise<SocketResponse[A]> => {
    const promise =  new Promise<SocketResponse[A]>(resolve => {
      const identifier = ++this.identifier 
      this.wm.set(identifier, resolve)
      const data = JSON.stringify({
        m: 0,
        i: identifier,
        n: topic,
        o: JSON.stringify(payload || {})
      });
      if (this.ready) {
        this.socket.send(data)
      } else {
        this.queue.push(data)
      }
    })
    return promise
  }

  close = () => {
    this.socket.close()
  }
}

export default BTZSocket
