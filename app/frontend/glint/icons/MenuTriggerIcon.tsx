import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="8" viewBox="0 0 17 8">
    <path id="Side_Menu" data-name="Side Menu" d="M-2889-6267a1,1,0,0,1-1-1,1,1,0,0,1,1-1h8a1,1,0,0,1,1,1,1,1,0,0,1-1,1Zm0-6a1,1,0,0,1-1-1,1,1,0,0,1,1-1h15a1,1,0,0,1,1,1,1,1,0,0,1-1,1Z" transform="translate(2890 6275)" fill="#141414" />
  </svg>
)

export const MenuTriggerIcon = props => (
  <Icon component={Svg} {...props} />
)
