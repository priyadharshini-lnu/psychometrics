import { Skeleton, Row, Col } from 'antd'

import styles from './styles.less'

export const PageContentSkeleton = () => (
  <>
    <Skeleton.Input className={styles.headerSkeleton} active size="large" block />
    <Row gutter={[0, 24]} className={styles.skeletonContainer}>
      <Col span={16}><Skeleton.Input active size="large" block /></Col>
      <Col offset={2}><Skeleton.Avatar shape="circle" active size="large" /></Col>
      <Col offset={1}><Skeleton.Avatar shape="circle" active size="large" /></Col>
      <Col span={24}><Skeleton.Input className={styles.skeletonItem} active size="large" block /></Col>
      <Col span={24}><Skeleton.Input className={styles.skeletonItem} active size="large" block /></Col>
    </Row>
  </>
)
