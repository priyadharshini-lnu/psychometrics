import React, { FC } from 'react'
import { Layout, Row, Col } from 'antd'

import styles from './styles.less'

type PageFooterProps = {
  footerLeft?: string | React.ReactElement
  footerMiddle: string | React.ReactElement
  footerRight: string | React.ReactElement
}

export const PageFooter: FC<PageFooterProps> = ({ footerLeft, footerMiddle, footerRight }) => {
  const colSpan = footerLeft ? 8 : 12
  return (
    <Layout.Footer className={styles.footer}>
      <Row align="middle" justify="space-between">
        {footerLeft && <Col span={8}>{footerLeft}</Col>}
        <Col span={colSpan}>{footerMiddle}</Col>
        <Col span={colSpan}>{footerRight}</Col>
      </Row>
    </Layout.Footer>
  )
}
