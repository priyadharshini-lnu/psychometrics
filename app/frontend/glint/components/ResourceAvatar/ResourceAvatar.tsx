import { FC } from 'react'
import { Avatar, Tooltip } from 'antd'

type Props = {
  url?: string | undefined | null,
  color?: string | undefined | null,
  name: string,
  tooltip?: string,
}

export const ResourceAvatar: FC<Props> = ({
  url,
  color,
  name,
  tooltip,
}) => {
  const body = url
    ? <Avatar src={url} />
    : (
      <Avatar style={{ backgroundColor: color as string | undefined, cursor: 'default' }}>
        {name.substring(0, 2)}
      </Avatar>
    )

  if (tooltip) {
    return (
      <Tooltip placement="top" title={tooltip}>{body}</Tooltip>
    )
  }

  return body
}
