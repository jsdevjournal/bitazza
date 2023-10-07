class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock()

export const thunkMiddleware = ({ dispatch, getState }) =>
  next =>
    action => {
      if (typeof action === 'function') {
        return action(dispatch, getState)
      }

      return next(action)
    }

export const createStore = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn()
  }
  const next = jest.fn()

  const invoke = action => thunkMiddleware(store)(next)(action)

  return { store, next, invoke }
}
