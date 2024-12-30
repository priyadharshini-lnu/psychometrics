import { FC } from 'react'
import {
  Row, Col, Space, Avatar, Typography,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { UserOutlined } from '@ant-design/icons'
import dayjs from '~/utils/dayjs'

import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import styles from './ProfileCardTitle.less'

const mapStateToProps = (state: RootState) => ({
  currentUser: getCurrentUser(state),
})
const connector = connect(mapStateToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const { Title, Text } = Typography
const { I18n } = window

const ProfileCardTitleComponent: FC<Props> = ({ currentUser }) => (
  <Row>
    <Col span={16}>
      <Space size="middle">
        <Avatar size={64} icon={!currentUser.photo && <UserOutlined />} src={currentUser.photo} />
        <Title level={1} className={styles.welcomeText}>
          {I18n.t('campaign.profile.welcome_text')}
          {' '}
          {currentUser.firstName}
        </Title>
      </Space>
    </Col>
    {currentUser.lastSignInAt && (
    <Col flex="auto" className={styles.lastLogin}>
      <Text>
        {I18n.t('campaign.profile.last_login_text')}
        {' '}
        {dayjs(currentUser.lastSignInAt).format('ll')}
      </Text>
    </Col>
    )}
  </Row>
)

export const ProfileCardTitle = connector(ProfileCardTitleComponent)
