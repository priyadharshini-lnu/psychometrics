import React from 'react'
import { Tooltip } from 'antd'

type Props = {
  title: string,
  maxLength: number,
  view: string,
}

export const TruncatedTitle: React.FC<Props> = ({ title, maxLength, view }) => {
  let truncatedTitle: React.ReactElement = <>{title}</>
  if (view !== 'list' && title.length > maxLength) {
    truncatedTitle = (
      <Tooltip title={title}>
        {title.slice(0, maxLength)}
        ...
      </Tooltip>
    )
  }
  return truncatedTitle
}
