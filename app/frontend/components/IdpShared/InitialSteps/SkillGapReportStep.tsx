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
  name: string
  value: string
}
type SkillGapReportStepProps = {
  next: () => void,
  idpUser: {
    id: string
    name: string
    email: string
    role: string
    photo?: string
    fields?: Field[]
  }
  skillGapData: Record<string, SkillGap[]> | null
}


export const SkillGapReportStep: FC<SkillGapReportStepProps> = ({
  next, idpUser, skillGapData,
}) => (
  <>
    <Typography.Title className={styles.title} level={3}>{I18n.t('idp.skill_gap_report')}</Typography.Title>
    <IdpUserProfileCard idpUser={idpUser} />
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
