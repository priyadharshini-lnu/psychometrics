import { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  List, Popover, Typography, Tag,
} from 'antd'

interface Props {
  tags: Array<{ title: string; url: string }>
}

export const TagListDisplay: FC<Props> = ({ tags }) => {
  if (tags.length === 0) {
    return <> - </>
  }

  if (tags.length === 1) {
    const cellDatum = tags[0]
    return <Link to={cellDatum.url}>{cellDatum.title}</Link>
  }

  const [firstCellDatum, ...restOfCellData] = tags

  const campaignsPopoverContent = (
    <List
      size="small"
      dataSource={restOfCellData}
      renderItem={cellDatum => (
        <List.Item>
          <Link to={cellDatum.url}>{cellDatum.title}</Link>
        </List.Item>
      )}
    />
  )

  return (
    <span>
      <Link to={firstCellDatum.url}>{firstCellDatum.title}</Link>
      {' '}
      <Popover content={campaignsPopoverContent}>
        <Tag>
          <Typography.Link>
            +
            {restOfCellData.length}
          </Typography.Link>
        </Tag>
      </Popover>
    </span>
  )
}
