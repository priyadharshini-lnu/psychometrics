import { FC } from 'react'

import styles from './styles.less'

type Props = {
  children: React.ReactNode
}

export const AssessmentCardContainer: FC<Props> = ({ children }) => <div className={styles.container}>{children}</div>
