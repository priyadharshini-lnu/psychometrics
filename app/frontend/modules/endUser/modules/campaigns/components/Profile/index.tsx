import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Avatar, Popover, Row, Col, Button,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import cs from 'classnames'

import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'

import styles from './styles.less'

const { I18n } = window

const mapStateToProps = (state: RootState) => ({
  currentUser: getCurrentUser(state),
})

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type ProfileProps = PropsFromRedux & {
  collapsed: boolean,
}

const ProfileComponent: FC<ProfileProps> = ({ currentUser, collapsed }) => {
  const userImg = collapsed
    ? (
      <Popover content={currentUser.fullName} trigger="hover">
        <Avatar src={currentUser.photo} size="large" icon={<UserOutlined />} />
      </Popover>
    )
    : <Avatar src={currentUser.photo} size="large" icon={<UserOutlined />} />

  const handleLogout = () => {
    window.location.href = '/users/sign_out'
  }

  return (
    <Row gutter={[6, 0]} justify="center">
      <Col>
        {userImg}
      </Col>
      <Col flex={1} className={cs({ 'ta-c': collapsed })}>
        {!collapsed && <div className={styles['profile-name']}>{currentUser.fullName}</div>}
        <Button
          className={styles['profile-logout']}
          type="link"
          onClick={handleLogout}
        >
          {I18n.t('navigation.logout')}
        </Button>
      </Col>
    </Row>
  )
}

export const Profile = connector(ProfileComponent)
