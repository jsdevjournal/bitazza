import { selectTrade, tradeSlice, State as TradeState, PriceHistoryPeriod } from '../trade'; // Adjust the import path
import { configureStore, EnhancedStore } from '@reduxjs/toolkit'

describe('selectTrade Selector', () => {
  let store: EnhancedStore;

  it('should filter and sort computed trades correctly', () => {
    
    const initialState: TradeState = {
      computed: {
        1: {
          InstrumentId: 1,
          Symbol: 'AAPL',
          Prices: [{ Close: 100 }, { Close: 110 }, { Close: 120 }],
        },
        2: {
          InstrumentId: 2,
          Symbol: 'GOOGL',
          Prices: [{ Close: 200 }, { Close: 210 }, { Close: 220 }],
        },
        3: {
          InstrumentId: 3,
          Symbol: 'MSFT',
          Prices: [{ Close: 300 }, { Close: 310 }, { Close: 320 }],
        },
      },
    }

    store = configureStore({
      preloadedState: {
        trade: initialState
      },
      reducer: {
        trade: tradeSlice.reducer,
      },
    });

    const search = 'A';
    const period = PriceHistoryPeriod.D;

    const result = selectTrade(search, period)(store.getState())

    expect(result.length).toBe(1)
    expect(result).toEqual([
      {
        Symbol: 'AAPL',
        InstrumentId: 1,
        Close: 100,
        Change: 100 - 110,
        ChangePercent: ((100 / 110) * 100) - 100,
      },
    ]);
  });
});
