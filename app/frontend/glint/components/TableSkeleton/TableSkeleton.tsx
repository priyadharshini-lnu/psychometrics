import { Table } from 'antd'
import _ from 'lodash'
import { FullWidthSkeleton } from '../FullWidthSkeleton'

const { Column } = Table

type Props = {
  columnsCount: number,
  rowsCount: number,
  cellHeight: string,
}

export function TableSkeleton ({ columnsCount, rowsCount, cellHeight }: Props) {
  const dataSource = _.range(0, rowsCount).map(number => ({ number }))
  return (
    <Table pagination={false} dataSource={dataSource}>
      {_.range(0, columnsCount).map(number => (
        <Column
          key={number}
          title={<FullWidthSkeleton active rows={1} height={cellHeight} />}
          dataIndex="id"
          render={() => <FullWidthSkeleton active rows={1} height={cellHeight} />}
        />
      ))}
    </Table>
  )
}
