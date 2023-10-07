import { type SelectComputedTrade } from '@/lib/redux/slices/trade'

type Props = {
  title: string,
  list: SelectComputedTrade[]
}

const Component: React.FC<Props> = ({
  title,
  list,
}) => {
  return (
    <>
      <h2 data-testid="title">{title}</h2>
      <table className="table table-xs">
        {/* head */}
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Last</th>
            <th>Change</th>
            <th>Change (%)</th>
          </tr>
        </thead>
        <tbody>
          {
            list.map(val => {
              const { InstrumentId, Symbol, Close, Change, ChangePercent } = val
              return (
                <tr key={InstrumentId}>
                  <th data-testid="symbol" >{Symbol}</th>
                  <td data-testid="close">${Close?.toFixed(4)}</td>
                  <td data-testid="change">{Change?.toFixed(4)}</td>
                  <td data-testid="changepercent">{ChangePercent?.toFixed(2)}%</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </>
  )
}
export default Component