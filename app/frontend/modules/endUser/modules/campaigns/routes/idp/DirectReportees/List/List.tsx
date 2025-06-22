import {
  FC, useEffect, useCallback,
} from 'react'
import {
  Typography, Avatar, Table, Tag,
  ConfigProvider,
  Badge,
  Tooltip,
  Flex,
} from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BoxWithShadow } from '~/glint'
import styles from '../DirectReportees.less'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { STATUS_COLORS } from '~/components/IdpShared/constants'

import {
  fetchDirectReportees,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'

const { I18n } = window

const connector = connect((state: RootState) => ({
  directReportees: state.campaigns.idp.directReportees,
  directReporteesTotalCount: state.campaigns.idp.directReporteesTotalCount,
}),
{
  fetchDirectReportees,
})

type PropsFromRedux = ConnectedProps<typeof connector>

interface User {
  status: string
  unreadCommentsCount: number
  user: {
    id: number
    photo?: string
    firstName: string
    lastName: string
    email: string
  }
}

const DEFAULT_PAGE_SIZE = 25

const columns = [
  {
    title: I18n.t('idp.users'),
    key: 'user',
    render (item: User) {
      return (
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} src={item.user.photo} alt={item.user.firstName} icon={<UserOutlined />} />
          <div className={styles.title}>
            <div className={styles.name}>
              {`${item.user.firstName} ${item.user.lastName}`}
              {!!item.unreadCommentsCount && (
                <Tooltip title={I18n.t('idp.new_comments')}>
                  <Badge dot={!!item.unreadCommentsCount} />
                </Tooltip>
              )}
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
        <Tag color={STATUS_COLORS[item.status]}>{I18n.t(`idp.user_idp_status.${item.status}`)}</Tag>
      )
    },
  },
  {
    title: I18n.t('idp.actions'),
    width: 200,
    render (item:User) {
      return (
        <Link to={`/idp/direct_reportees/${item.user.id}`}>
          {I18n.t('idp.details')}
        </Link>
      )
    },
  },
]

export const Component: FC<PropsFromRedux> = ({
  directReportees,
  directReporteesTotalCount,
  fetchDirectReportees,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)

  const handleTableChange = useCallback((pagination) => {
    setSearchParams({ page: pagination.current })
    fetchDirectReportees({ page: pagination.current, pageSize: DEFAULT_PAGE_SIZE })
  }, [fetchDirectReportees, setSearchParams])

  useEffect(() => {
    fetchDirectReportees({ page, pageSize: DEFAULT_PAGE_SIZE })
  }, [fetchDirectReportees, page])

  return (
    <IdpPageLayoutWrapper>
      <Flex className={styles.pageContent}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {I18n.t('campaign.dashboard_menu.direct_reportees')}
        </Typography.Title>
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
              dataSource={directReportees}
              pagination={{
                current: page,
                pageSize: DEFAULT_PAGE_SIZE,
                total: directReporteesTotalCount,
                hideOnSinglePage: true,
              }}
              onChange={handleTableChange}
              rowKey={item => item.user.id}
            />
          </ConfigProvider>
        </BoxWithShadow>
      </Flex>
    </IdpPageLayoutWrapper>
  )
}

export const DirectReporteesList = connector(Component)
