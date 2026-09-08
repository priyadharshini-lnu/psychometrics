import React from 'react'
import { Avatar } from '@thetalententerprise/glint'
import { shortify } from '~/utils/string'

type CandidateAvatarProps = {
  name: string
  size?: 'small' | 'default' | 'large' | number
}

export const CandidateAvatar: React.FC<CandidateAvatarProps> = ({ name, size }) => (
  <Avatar style={{ background: 'var(--ant-primary-color)' }} size={size}>
    {shortify(name)}
  </Avatar>
)
