import React, { FC } from 'react'
import { Layout, Row, Col } from 'antd'
import cs from 'classnames'

import styles from './styles.less'

type PageFooterProps = {
  footerLeft?: string | React.ReactElement
  footerMiddle: string | React.ReactElement
  footerRight: string | React.ReactElement
}

export const PageFooter: FC<PageFooterProps> = ({ footerLeft, footerMiddle, footerRight }) => {
  const colSpan = footerLeft ? 8 : 12
  return (
    <Layout.Footer className={styles['page-footer']}>
      <Row align="middle" justify="space-between">
        {footerLeft && (
          <Col className={styles['footer-left']} span={8} xs={6}>
            {footerLeft}
          </Col>
        )}
        <Col
          className={cs({ [styles['footer-middle']]: footerLeft, [styles['footer-left']]: !footerLeft })}
          span={colSpan}
          xs={colSpan + 4}
        >
          {footerMiddle}
        </Col>
        <Col className={styles['footer-right']} span={colSpan} xs={colSpan - 2}>
          {footerRight}
        </Col>
      </Row>
    </Layout.Footer>
  )
}
