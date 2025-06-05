import { FC } from 'react'

import styles from './styles.less'

type Props = {
  children: React.ReactNode
  className?: string
}

export const AssessmentCardContainer: FC<Props> = ({ children, className }) => (
  <div
    className={`${styles.container} ${className}`}
  >
    {children}
  </div>
)
