import { type Instrument } from '@/lib/redux/slices/trade'

type Props = {
  title: string,
  list: (Instrument & {
    Meta: { Close: number, Change: number, ChangePercent: number }
  })[]
}

const Component: React.FC<Props> = ({
  title,
  list,
}) => {
  return (
    <>
      <h2>{title}</h2>
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
              const { InstrumentId, Symbol, Meta } = val
              const { Close, Change, ChangePercent } = Meta
              return (
                <tr key={InstrumentId}>
                  <th>{Symbol}</th>
                  <td>${Close?.toFixed(4)}</td>
                  <td>{Change?.toFixed(4)}</td>
                  <td>{ChangePercent?.toFixed(2)}%</td>
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