import { FC, ReactNode } from 'react'
import { Divider } from 'antd'
import styles from './BookingConfirmationContainer.less'

type Props = {
  headerContent: string | ReactNode
  detailsContent: string | ReactNode
  footerContent: string | ReactNode
}

export const BookingConfirmationContainer: FC<Props> = ({ headerContent, detailsContent, footerContent }) => (
  <div className={styles.container}>
    <div className="ta-c">{headerContent}</div>
    <Divider />
    <div>{detailsContent}</div>
    <Divider />
    <div>{footerContent}</div>
  </div>
)
