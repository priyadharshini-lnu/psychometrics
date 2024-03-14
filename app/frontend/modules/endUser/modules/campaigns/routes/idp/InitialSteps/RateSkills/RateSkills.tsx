import { Typography } from 'antd'
import { ButtonWithArrow, BoxWithShadow } from '~/glint'
import styles from './RateSkills.less'

export const RateSkills = ({ next }) => (
  <>
    <BoxWithShadow style={{ padding: '24px', marginTop: 16, minHeight: 400 }}>
      <Typography.Title level={3}>Rate Skills placeholder</Typography.Title>
    </BoxWithShadow>
    <div className={styles.footer}>
      <ButtonWithArrow label="Next" size="small" type="primary" onClick={() => next()} />
    </div>
  </>
)
