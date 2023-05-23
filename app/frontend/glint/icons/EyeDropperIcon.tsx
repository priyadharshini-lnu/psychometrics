import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="m15.584 10.001-1.586-1.584-8.095 8.095-.529 2.114 2.114-.529z" fill="none" />
    <path d="m4.03 15.758-1 4c-.086.341.015.701.263.949.189.189.445.293.707.293.081 0 .162-.01.242-.03l4-1c.176-.044.337-.135.465-.263l8.292-8.292 1.294 1.292 1.414-1.414-1.294-1.292 2.587-2.587c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.072-.756-2.828 0l-2.589 2.589-1.298-1.296-1.414 1.414 1.298 1.296-8.29 8.29c-.128.128-.219.289-.263.465zm1.873.754 8.095-8.095 1.586 1.584-8.096 8.096-2.114.529z" />
  </svg>
)

export const EyeDropperIcon = props => (
  <Icon component={Svg} {...props} />
)
