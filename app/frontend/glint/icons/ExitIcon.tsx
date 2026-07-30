import { FC } from 'react'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'
import Icon from '~/glint/icons/AccessibleIconsAntDesign'

const Svg: FC<CustomIconComponentProps> = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="1em"
    height="1em"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export const ExitIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Svg} {...props} />
)
