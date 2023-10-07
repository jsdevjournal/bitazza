import InstrumentTable from '../index'
import "@testing-library/jest-dom"
import { render } from "@testing-library/react"

const mockData = [
  {
    InstrumentId: 1,
    Symbol: 'AAPL',
    Close: 150, Change: 5, ChangePercent: 3
  },
  {
    InstrumentId: 2,
    Symbol: 'GOOGL',
    Close: 2000, Change: -10, ChangePercent: -0.5
  },
];

test('Component renders with correct data', () => {
  const { getByTestId, getAllByTestId } = render(<InstrumentTable title="Stocks" list={mockData} />);

  const titleElement = getByTestId('title');
  expect(titleElement).toBeInTheDocument();
  expect(titleElement).toHaveTextContent('Stocks');

  const symbolElement = getAllByTestId('symbol');
  expect(symbolElement[0]).toBeInTheDocument();
  expect(symbolElement[0]).toHaveTextContent('AAPL');

  const closeElement = getAllByTestId('close');
  expect(closeElement[0]).toBeInTheDocument();
  expect(closeElement[0]).toHaveTextContent('$150.0000');

  const changeElement = getAllByTestId('change');
  expect(changeElement[0]).toBeInTheDocument();
  expect(changeElement[0]).toHaveTextContent('5.0000');

  const changePercentElement = getAllByTestId('changepercent');
  expect(changePercentElement[0]).toBeInTheDocument();
  expect(changePercentElement[0]).toHaveTextContent('3.00%');
})
