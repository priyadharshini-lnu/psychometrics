import { FC, ReactElement } from 'react'
import { Card } from 'antd'
import styles from './ThreesixtyCard.less'

type Props = {
  title: string | ReactElement
  helpIcon?: string | ReactElement
}

export const ThreesixtyCard: FC<Props> = ({ title, helpIcon, children }) => (
  <Card
    title={title}
    extra={helpIcon}
    className={styles.card}
  >
    {children}
  </Card>
)
