import { Typography } from 'antd'
import { ButtonWithArrow, BoxWithShadow } from '~/glint'
import styles from './AddSkills.less'

export const AddSkills = ({ next }) => (
  <>
    <div style={{ display: 'flex', marginTop: 24 }}>
      <div style={{ flex: 2 }}>
        <BoxWithShadow style={{ height: 200, padding: '24px 24px' }}>
          Exploring behavior skill placeholder
        </BoxWithShadow>
        <BoxWithShadow style={{ height: 200, marginTop: 24, padding: '24px 24px' }}>
          Exploring your technical skill placeholder
        </BoxWithShadow>
      </div>
      <div style={{ flex: 1, marginLeft: 24 }}>
        <BoxWithShadow style={{ padding: '24px 24px', minHeight: 424 }}>
          <Typography.Title level={3}>Selected Skill</Typography.Title>
          Skills List placeholder
        </BoxWithShadow>
      </div>
    </div>
    <div className={styles.footer}>
      <ButtonWithArrow label="Continue to rate skills" size="small" type="primary" onClick={() => next()} />
    </div>
  </>
)
