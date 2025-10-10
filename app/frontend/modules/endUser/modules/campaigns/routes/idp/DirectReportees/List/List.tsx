import {
  FC, useEffect, useCallback, useState, useContext,
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
import cs from 'classnames'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BoxWithShadow, MediaQueryContext } from '~/glint'
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


export const Component: FC<PropsFromRedux> = ({
  directReportees,
  directReporteesTotalCount,
  fetchDirectReportees,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const page = parseInt(searchParams.get('page') || '1', 10)

  const { isMobile } = useContext(MediaQueryContext)


  const columns = [
    {
      title: I18n.t('idp.users'),
      key: 'user',
      render (item: User) {
        return (
          <div className={styles.userInfo}>
            <Avatar
              className={cs(styles.avatar, 'mb-2')}
              src={item.user.photo}
              alt={item.user.firstName}
              icon={<UserOutlined />}
            />
            <div className={styles.title}>
              <div className={cs(styles.name, 'mb-2')}>
                {`${item.user.firstName} ${item.user.lastName}`}
                {!!item.unreadCommentsCount && (
                  <Tooltip title={I18n.t('idp.new_comments')}>
                    <Badge dot={!!item.unreadCommentsCount} />
                  </Tooltip>
                )}
              </div>
              <div className={cs(styles.email, 'mb-2')}>
                {item.user.email}
              </div>
              <Tag color={STATUS_COLORS[item.status]}>
                {I18n.t(`idp.user_idp_status.${item.status}`)}
              </Tag>
            </div>
          </div>
        )
      },
    },
    ...(!isMobile ? [
      {
        title: I18n.t('idp.status'),
        key: 'status',
        width: 200,
        render (item: User) {
          return (
            <Tag color={STATUS_COLORS[item.status]}>
              {I18n.t(`idp.user_idp_status.${item.status}`)}
            </Tag>
          )
        },
      },
    ] : []),
    {
      title: I18n.t('idp.actions'),
      width: 50,
      className: isMobile ? 'vertical-align-bottom' : '',
      render (item:User) {
        return (
          <Link to={`/idp/direct_reportees/${item.user.id}`}>
            {I18n.t('idp.details')}
          </Link>
        )
      },
    },
  ]

  const handleTableChange = useCallback((pagination) => {
    setSearchParams({ page: pagination.current })
    fetchDirectReportees({ page: pagination.current, pageSize: DEFAULT_PAGE_SIZE })
  }, [fetchDirectReportees, setSearchParams])

  useEffect(() => {
    setIsLoading(true)
    fetchDirectReportees({ page, pageSize: DEFAULT_PAGE_SIZE }).then(() => {
      setIsLoading(false)
    })
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
              loading={isLoading}
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
