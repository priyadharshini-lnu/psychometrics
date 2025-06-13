import { FC, useContext } from 'react'
import {
  Space, Avatar, Typography, Row, Col,
} from 'antd'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BoxWithShadow, MediaQueryContext } from '~/glint'
import styles from './IdpUserProfileCard.less'

type Field = {
  name: string
  value: string
}

type IdpUserProfileCardProps = {
  idpUser: {
    id: string
    name: string
    email: string
    role: string
    photo?: string
    fields?: Field[]
  }
}

export const IdpUserProfileCard: FC<IdpUserProfileCardProps> = ({ idpUser }) => {
  const { isMobile } = useContext(MediaQueryContext)
  return (
    <BoxWithShadow className={styles.idpUserProfileCard}>
      <Row gutter={[20, 20]} align="middle" justify="center" wrap>
        <Col xs={24} sm={6}>
          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
            <Avatar
              size={64}
              src={idpUser.photo}
              icon={<UserOutlined />}
              className={styles.avatar}
            />
            <div className={styles.userInfo}>
              <Typography.Title level={5} style={{ margin: 0 }}>{idpUser.name}</Typography.Title>
              <Typography.Text>{idpUser.email}</Typography.Text>
              <Typography.Text type="secondary">{idpUser.role}</Typography.Text>
            </div>
          </Space>
        </Col>
        {getPairedFields(idpUser.fields ?? []).map((fieldPair, i) => (
          <Col flex="auto" className={styles.fieldContainer} key={i}>
            <Space direction="vertical" size="large">
              {fieldPair.map(fieldObj => (
                <Space direction="vertical">
                  <Typography.Text type="secondary">
                    {fieldObj.name}
                    :
                  </Typography.Text>
                  <Typography.Text>{fieldObj.value}</Typography.Text>
                </Space>
              ))}
            </Space>
          </Col>
        ))}
      </Row>
    </BoxWithShadow>
  )
}

const getPairedFields = (fields: Field[]) => {
  const pairedFields: Array<Field[]> = []
  for (let i = 0; i < fields.length; i += 2) {
    const fieldsPair = fields[i + 1] ? [fields[i], fields[i + 1]] : [fields[i]]
    pairedFields.push(fieldsPair)
  }
  return pairedFields
}
