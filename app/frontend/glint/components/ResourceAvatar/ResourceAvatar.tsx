import { FC } from 'react'
import { Avatar, Tooltip, AvatarProps } from 'antd'

import { shortify } from '~/utils/string'

type Props = {
  url?: string | undefined | null,
  color?: string | undefined | null,
  name: string,
  tooltip?: string,
} & AvatarProps

export const ResourceAvatar: FC<Props> = ({
  url,
  color,
  name,
  tooltip,
  ...props
}) => {
  const body = url
    ? <Avatar src={url} {...props} />
    : (
      <Avatar {...props} style={{ backgroundColor: color as string | undefined, cursor: 'default' }}>
        {shortify(name)}
      </Avatar>
    )

  if (tooltip) {
    return (
      <Tooltip placement="top" title={tooltip}>{body}</Tooltip>
    )
  }

  return body
}
