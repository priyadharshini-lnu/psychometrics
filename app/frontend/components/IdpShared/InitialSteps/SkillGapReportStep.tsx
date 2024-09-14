import { FC } from 'react'
import { Typography, Row, Col } from 'antd'
import {
  ButtonWithArrow, BoxWithShadow, ProgressBarWithCutoff,
} from '~/glint'
import { IdpUserProfileCard } from './IdpUserProfileCard'

import styles from './SkillGapReportStep.less'

const { I18n } = window

type SkillGap = {
  id: number
  name: string
  desiredRating: number
  score: number
  maxRating: number
  minRating: number
}
type Field = {
  field: string
  value: string
}
type SkillGapReportStepProps = {
  next: () => void,
  currentUser: Record<string, string>,
  skillGapData: Record<string, SkillGap[]> | null
  fields: Field[]
}


export const SkillGapReportStep: FC<SkillGapReportStepProps> = ({
  next, currentUser, skillGapData, fields,
}) => (
  <>
    <Typography.Title className={styles.title} level={3}>{I18n.t('idp.skill_gap_report')}</Typography.Title>
    <IdpUserProfileCard fields={fields || []} currentUser={currentUser} />
    {skillGapData && Object.keys(skillGapData).map(category => (
      <BoxWithShadow key={category} className={styles.skillGapBox}>
        <Typography.Title level={4}>{category}</Typography.Title>
        <Row gutter={[32, 0]}>
          {skillGapData[category].map((skill) => {
            const {
              desiredRating, score, maxRating, minRating,
            } = skill
            const cutoffPercent = ((desiredRating - minRating) / (maxRating - minRating)) * 100
            const scorePercent = ((score - minRating) / (maxRating - minRating)) * 100
            return (
              <Col key={skill.id} xs={{ span: 24 }} sm={{ span: 12 }}>
                <ProgressBarWithCutoff
                  cutoffPercent={Math.round(cutoffPercent)}
                  title={<Typography.Text>{skill.name}</Typography.Text>}
                  percent={Math.round(scorePercent)}
                />
              </Col>
            )
          })}
        </Row>
      </BoxWithShadow>
    ))}
    <div className={styles.footer}>
      <ButtonWithArrow label="Continue to add skills" size="small" type="primary" onClick={() => next()} />
    </div>
  </>
)
