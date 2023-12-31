import { createSlice, createAction, createAsyncThunk, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import btzsocket, { type SocketListener, SocketResponse } from '@/lib/socket'

export const loginAsync = createAsyncThunk(
  'session/loginAsync',
  async ({
    Username, Password
  } : {
    Username: string, Password: string
  }, thunkAPI) => {
    const response = await btzsocket.getInstance().sendPromise('AuthenticateUser', { Username, Password })
    if (!response.Authenticated) {
      return thunkAPI.rejectWithValue(response.errormsg)
    }
    return response
  }
)

export const login = (Username: string, Password: string) => {
  btzsocket.getInstance().send('AuthenticateUser', { Username, Password });
}

export const logOut = () => {
  btzsocket.getInstance().send('LogOut');
}

export const loggedIn = createAction<SocketResponse['AuthenticateUser']>('session/loggedIn')

export type SessionState = {
  isInit: boolean
  user?: Object | null
}

const initialState = {
  isInit: false
} as SessionState

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    init: (state: SessionState) => {
      let user
      if (typeof window !== 'undefined') {
        try {
          user = JSON.parse(localStorage.getItem('user') || '')
        } catch (e) {}
      }
      if (user) {
        state.user = user
      }
      state.isInit = true
    },
    loggedOut: (state: SessionState) => {
      localStorage?.removeItem('user')
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(loginAsync.fulfilled, loggedIn),
      (state, action: PayloadAction<SocketResponse['AuthenticateUser']>) => {
        const res = action.payload
        if (res.Authenticated) {
          localStorage?.setItem('user', JSON.stringify(res.User))
          state.user = res.User
        }
      }
    )
  },
})

const loginListener: SocketListener = {
  onOpen(store) {
    store?.dispatch(init())
  },
  onMessage(e, store) {
    if (e.n === 'AuthenticateUser') {
      store?.dispatch(loggedIn(e.o as SocketResponse['AuthenticateUser']))
    }
    if (e.n === 'LogOut') {
      store?.dispatch(loggedOut())
    }
  }
}

btzsocket.getInstance().addListener(loginListener)

// Action creators are generated for each case reducer function
export const { loggedOut, init } = sessionSlice.actions
// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: { session: SessionState }) => state.session.user
export const selectIsInit = (state: { session: SessionState }) => state.session.isInit
