import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="21.656" height="27.431" viewBox="0 0 21.656 27.431">
    <path id="Profile" d="M15231.886,4924.431a2.889,2.889,0,0,1-2.886-2.89,10.828,10.828,0,0,1,21.656,0,2.89,2.89,0,0,1-2.891,2.89Zm1.807-21.3a6.135,6.135,0,1,1,6.136,6.136A6.137,6.137,0,0,1,15233.692,4903.135Z" transform="translate(-15229 -4897)" fill="#009ea7" />
  </svg>
)

export const ProfileIcon = props => (
  <Icon component={Svg} {...props} />
)
