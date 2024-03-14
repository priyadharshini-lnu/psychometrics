import { Typography } from 'antd'
import { ButtonWithArrow, BoxWithShadow } from '~/glint'
import styles from './SkillGapReport.less'

const { I18n } = window

export const SkillGapReport = ({ next }) => (
  <>
    <Typography.Title className={styles.title} level={3}>{I18n.t('idp.skill_gap_report')}</Typography.Title>
    <BoxWithShadow style={{ padding: '24px', marginTop: 16, minHeight: 200 }}>
      Profile Details Placeholder
    </BoxWithShadow>
    <BoxWithShadow style={{ padding: '24px', marginTop: 16, minHeight: 200 }}>
      Gap Report placegolder
    </BoxWithShadow>
    <div className={styles.footer}>
      <ButtonWithArrow label="Continue to add skills" size="small" type="primary" onClick={() => next()} />
    </div>
  </>
)
