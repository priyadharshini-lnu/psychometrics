import {
  useContext, FC,
} from 'react'
import {
  Typography, Row, Col, Avatar, Space,
} from 'antd'
import {
  ButtonWithArrow, BoxWithShadow, ProgressBarWithCutoff, MediaQueryContext,
} from '~/glint'

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
}) => {
  const { isMobile } = useContext(MediaQueryContext)

  return (
    <>
      <Typography.Title className={styles.title} level={3}>{I18n.t('idp.skill_gap_report')}</Typography.Title>
      <UserProfileCard isMobile={isMobile} fields={fields || []} currentUser={currentUser} />
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
}

type UserProfileCardProps = {
  isMobile: boolean
  fields: Field[] | []
  currentUser: Record<string, string>
}

const UserProfileCard: FC<UserProfileCardProps> = ({ isMobile, fields, currentUser }) => (
  <BoxWithShadow style={{ padding: '12px', marginTop: 16 }}>
    <Typography.Title level={5}>{I18n.t('idp.profile_details')}</Typography.Title>
    <Row gutter={[20, 20]}>
      <Col xs={{ span: 24 }} sm={{ span: 4 }}>
        <Space direction={isMobile ? 'horizontal' : 'vertical'}>
          <Avatar size="large" src={currentUser.photo} />
          <Space size={0} direction="vertical">
            <Typography.Title level={5}>{currentUser.fullName}</Typography.Title>
            {currentUser.role}
          </Space>
        </Space>
      </Col>
      {getPairedFields(fields).map(fieldPair => (
        <>
          <Col flex="auto" className={styles.fieldContainer}>
            <Space direction="vertical" size="large">
              {fieldPair.map(fieldObj => (
                <Space direction="vertical">
                  <Typography.Text>
                    {fieldObj.field}
                    :
                  </Typography.Text>
                  <Typography.Text>{fieldObj.value}</Typography.Text>
                </Space>
              ))}
            </Space>
          </Col>
        </>
      ))}
    </Row>
  </BoxWithShadow>
)

const getPairedFields = (fields: Field[]) => {
  const newLength = Math.ceil(fields.length / 2)
  const pairedFields: Array<Field[]> = []
  for (let i = 0; i < newLength; i += 2) {
    const fieldsPair = fields[i + 1] ? [fields[i], fields[i + 1]] : [fields[i]]
    pairedFields.push(fieldsPair)
  }
  return pairedFields
}
