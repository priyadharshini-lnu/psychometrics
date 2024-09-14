import { FC, useContext } from 'react'
import {
  Space, Avatar, Typography, Row, Col,
} from 'antd'
import { BoxWithShadow, MediaQueryContext } from '~/glint'

import styles from './IdpUserProfileCard.less'

const { I18n } = window

type Field = {
  field: string
  value: string
}

type IdpUserProfileCardProps = {
  fields: Field[] | []
  currentUser: Record<string, string>
}

export const IdpUserProfileCard: FC<IdpUserProfileCardProps> = ({ fields, currentUser }) => {
  const { isMobile } = useContext(MediaQueryContext)
  return (
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
}

const getPairedFields = (fields: Field[]) => {
  const newLength = Math.ceil(fields.length / 2)
  const pairedFields: Array<Field[]> = []
  for (let i = 0; i < newLength; i += 2) {
    const fieldsPair = fields[i + 1] ? [fields[i], fields[i + 1]] : [fields[i]]
    pairedFields.push(fieldsPair)
  }
  return pairedFields
}
