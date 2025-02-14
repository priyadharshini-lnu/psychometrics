import { FC, useEffect } from 'react'
import {
  Typography, Avatar, Table, Tag,
  ConfigProvider,
} from 'antd'
import { Link } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { BoxWithShadow } from '~/glint'
import styles from './List.less'
import { RootState } from '~/modules/endUser/core/rootReducers'

import {
  fetchDirectReports,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

const { I18n } = window


const connector = connect((state: RootState) => ({
  directReports: state.campaigns.idp.directReports,
}),
{
  fetchDirectReports,
})

type PropsFromRedux = ConnectedProps<typeof connector>

interface User {
  status: string
  user: {
    id: number
    photo?: string
    firstName: string
    lastName: string
    email: string
  }
}

const statusColors = {
  pending_approval: 'orange',
  approved: 'green',
}

const columns = [
  {
    title: I18n.t('idp.users'),
    key: 'user',
    render (item: User) {
      return (
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} src={item.user.photo} alt={item.user.firstName} />
          <div className={styles.title}>
            <div className={styles.name}>
              {`${item.user.firstName} ${item.user.lastName}`}
            </div>
            <div className={styles.email}>
              {item.user.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    title: I18n.t('idp.status'),
    key: 'status',
    width: 200,
    render (item:User) {
      return (
        <Tag color={statusColors[item.status]}>{I18n.t(`idp.user_idp_status.${item.status}`)}</Tag>
      )
    },
  },
  {
    title: I18n.t('idp.actions'),
    width: 200,
    render (item:User) {
      return (
        <Link to={`/idp/direct_reports/${item.user.id}`}>
          {I18n.t('idp.details')}
        </Link>
      )
    },
  },
]

export const Component: FC<PropsFromRedux> = ({ directReports, fetchDirectReports }) => {
  useEffect(() => {
    fetchDirectReports()
  }, [])

  const pending = directReports.filter(i => i.status === 'pending_approval')
  const approved = directReports.filter(i => i.status === 'approved')

  return (
    <div className={styles.main}>
      <div className={styles.pageContent}>
        <Typography.Title level={3}>{I18n.t('idp.my_direct_reports')}</Typography.Title>
        <BoxWithShadow className={styles.box}>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: '#fff',
                },
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={[...pending, ...approved]}
              pagination={false}
            />
          </ConfigProvider>
        </BoxWithShadow>
      </div>
    </div>
  )
}

export const DirectReportsList = connector(Component)
