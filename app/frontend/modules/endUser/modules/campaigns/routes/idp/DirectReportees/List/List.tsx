import {
  FC, useEffect, useCallback, useState, useContext, useRef,
} from 'react'
import {
  Typography, Avatar, Table, Tag,
  ConfigProvider, Spin,
  Badge,
  Tooltip,
  Flex, Button, Drawer,
} from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import { UserOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BoxWithShadow, MediaQueryContext } from '~/glint'
import styles from '../DirectReportees.less'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { STATUS_COLORS, USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import {
  fetchDirectReportees, updateUserIdpPlan,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { Summary } from '../Summary'

const { I18n } = window

const connector = connect((state: RootState) => ({
  directReportees: state.campaigns.idp.directReportees,
  directReporteesTotalCount: state.campaigns.idp.directReporteesTotalCount,
}),
{
  fetchDirectReportees,
  updateUserIdpPlan,
})

type PropsFromRedux = ConnectedProps<typeof connector>

interface User {
  status: string
  unreadCommentsCount: number
  pendingInitialReview: boolean
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
  updateUserIdpPlan,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [currentSummary, setCurrentSummary] = useState<null | {reporteeId: number, reporteeName: string}>(null)
  const page = parseInt(searchParams.get('page') || '1', 10)

  const { isMobile } = useContext(MediaQueryContext)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const columns = [
    {
      title: I18n.t('idp.users'),
      key: 'user',
      render (item: User) {
        return (
          <div className={styles.userInfo}>
            <Avatar
              className={cs(styles.avatar, 'mb-2', 'me-2')}
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
              {isMobile && (
                <Tag color={STATUS_COLORS[item.status]}>
                  {I18n.t(`idp.user_idp_status.${item.status}`)}
                </Tag>
              )}
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
      width: 200,
      className: isMobile ? 'vertical-align-bottom' : '',
      render (item:User) {
        return (
          <Flex vertical={isMobile} gap={8}>
            <Link to={`/idp/direct_reportees/${item.user.id}`}>
              {I18n.t('idp.details')}
            </Link>
            {((item.status === USER_IDP_PLAN_STATUS.PENDING_APPROVAL
            || item.status === USER_IDP_PLAN_STATUS.IN_REVIEW) && (!item.pendingInitialReview))
             && (
               <Button
                 onClick={() => {
                   if (item.status === USER_IDP_PLAN_STATUS.PENDING_APPROVAL) {
                     updateUserIdpPlan(item.user.id.toString(), USER_IDP_PLAN_STATUS.IN_REVIEW).finally(() => {
                       refetchDirectReportees({
                         reporteeId: item.user.id,
                         reporteeName: `${item.user.firstName} ${item.user.lastName}`,
                       })
                     })
                   } else {
                     setCurrentSummary({
                       reporteeId: item.user.id,
                       reporteeName: `${item.user.firstName} ${item.user.lastName}`,
                     })
                   }
                 }}
                 className="ps-0 pe-0 self-start"
                 type="link"
               >
                 <span style={{ marginBottom: '0.7rem' }}>
                   {I18n.t('idp.summary')}
                 </span>
               </Button>
             )}

          </Flex>

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

  const refetchDirectReportees = (reportee: {reporteeId: number, reporteeName:string} | null) => {
    setIsLoading(true)
    fetchDirectReportees({ page, pageSize: DEFAULT_PAGE_SIZE }).then(() => {
      setIsLoading(false)
      if (reportee) setCurrentSummary(reportee)
    })
  }

  return (
    <IdpPageLayoutWrapper style={{ position: 'relative' }}>
      {isLoading && <Spin className={styles.pageSpinner} />}
      <Flex className={styles.pageContent} style={{ opacity: isLoading ? 0.4 : 1 }}>
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
              sticky
              style={{ overflowY: isLoading ? 'hidden' : 'auto', maxHeight: '80%' }}
              onChange={handleTableChange}
              rowKey={item => item.user.id}
            />
          </ConfigProvider>
        </BoxWithShadow>
      </Flex>
      <Drawer
        size="large"
        title={`${I18n.t('idp.summary_logs', { reporteeName: currentSummary?.reporteeName })}`}
        open={!!currentSummary}
        destroyOnClose
        styles={{
          mask: {
            backgroundColor: 'rgba(0,0,0,0.05)',
          },
          content: {
            boxShadow: 'none',
          },
        }}
        maskClosable={false}
        closeIcon={(
          <Button
            onClick={() => { setCurrentSummary(null) }}
            style={{ border: 'none' }}
            ref={btnRef}
            icon={<CloseOutlined />}
          />
        )}
        afterOpenChange={(isOpen) => {
          if (isOpen && btnRef && btnRef?.current) {
            btnRef?.current?.focus()
          }
        }}
      >
        {currentSummary && (
          <Summary
            setCurrentSummary={setCurrentSummary}
            refetchDirectReportees={refetchDirectReportees}
            reportee={currentSummary}
          />
        )}
      </Drawer>
    </IdpPageLayoutWrapper>
  )
}

export const DirectReporteesList = connector(Component)
