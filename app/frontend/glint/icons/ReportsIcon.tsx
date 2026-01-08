import { FC } from 'react'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'
import Icon from '@ant-design/icons'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="20.142" height="26.858" viewBox="0 0 20.142 26.858">
    <path id="Reports" d="M15230.678,4923.859a1.679,1.679,0,0,1-1.676-1.68v-23.5a1.679,1.679,0,0,1,1.676-1.68h10.073v6.713a1.681,1.681,0,0,0,1.676,1.68h6.717v16.786a1.683,1.683,0,0,1-1.68,1.68Zm11.749-3.36h3.36V4908.75h-3.36Zm-5.036,0h3.36v-8.393h-3.36Zm-5.032,0h3.356v-5.033h-3.356Zm10.068-16.785V4897l6.717,6.713Z" transform="translate(-15229.002 -4897)" fill="#e89f0f" />
  </svg>
)

export const ReportsIcon = props => (
  <Icon component={Svg} {...props} />
)
