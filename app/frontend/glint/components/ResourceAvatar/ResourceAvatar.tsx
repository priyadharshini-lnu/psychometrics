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
      <Avatar {...props} style={{ backgroundColor: color || computedColor(name), cursor: 'default' }}>
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

function computedColor (userName: string): string {
  const colorCode = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10
  const hash = {
    0: '#ae7181', // mauve
    1: '#06c2ac', // turquoise
    2: '#650021', // maroon
    3: '#6e750e', // olive
    4: '#029386', // teal
    5: '#f97306', // orange
    6: '#cf6275', // rose
    7: '#a2cffe', // baby blue
    8: '#8eab12', // pea green
    9: '#90e4c1', // light teal
  }
  return hash[colorCode]
}
