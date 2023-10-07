import '../../test-util'
import { configureStore, EnhancedStore, PayloadAction } from '@reduxjs/toolkit';
import {
  loginAsync,
  login,
  logOut,
  loggedIn,
  sessionSlice,
} from '../session'; // Adjust the import path
import { type SocketResponse } from '@/lib/socket'

describe('Session Slice', () => {
  let store: EnhancedStore

  beforeEach(() => {
    store = configureStore({
      reducer: {
        session: sessionSlice.reducer,
      },
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should handle init action correctly', () => {
    localStorage.setItem('user', JSON.stringify({ userId: 1, userName: 'testUser' }))

    store.dispatch(sessionSlice.actions.init());
    
    expect(store.getState().session.isInit).toBe(true);
    expect(store.getState().session.user).toEqual({ userId: 1, userName: 'testUser' });
  });

  it('should handle loggedOut action correctly', () => {
    localStorage.setItem('user', JSON.stringify({ userId: 1, userName: 'testUser' }))

    store.dispatch(sessionSlice.actions.init());
    store.dispatch(sessionSlice.actions.loggedOut());

    expect(store.getState().session.isInit).toBe(true);
    expect(store.getState().session.user).toBeNull();
  });

  it('should handle loginAsync.fulfilled action correctly', () => {
    const userResponse: SocketResponse['AuthenticateUser'] = {
      Authenticated: true,
      User: { userId: 1, userName: 'testUser' },
    };
    const action: PayloadAction<SocketResponse['AuthenticateUser']> = {
      type: loginAsync.fulfilled.type,
      payload: userResponse,
    };
    
    store.dispatch(action);

    expect(store.getState().session.user).toEqual(userResponse.User);
  });

  it('should handle loggedIn action correctly', () => {
    const userResponse: SocketResponse['AuthenticateUser'] = {
      Authenticated: true,
      User: { userId: 1, userName: 'testUser' },
    };

    store.dispatch(loggedIn(userResponse));

    expect(store.getState().session.user).toEqual(userResponse.User);
  });
});

// Additional tests can be added for login, logOut, and other asynchronous actions.
