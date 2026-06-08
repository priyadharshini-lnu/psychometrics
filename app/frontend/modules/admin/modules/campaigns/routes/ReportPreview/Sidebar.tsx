import { useEffect, useMemo } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import {
  Tag, Tabs, Row, Col, Avatar, Typography, Space, Divider,
} from 'antd'
import _ from 'lodash'
import { CheckOutlined, UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import {
  get as getUserReport,
  getCurrent,
  approveReport,
  ApprovalStatuses,
  selectModule,
} from '~/modules/admin/modules/campaigns/core/userReports'
import Utils from '~/modules/reports/utils/Utils'
import { RootState } from '~/modules/admin/core/rootReducers'
import ScrollDispatcher from '~/modules/reports/dispatchers/ScrollDispatcher'
import { SafeHTML } from '~/components/SafeHTML'
import { subscribeSocket } from '~/core/socket'
import Comments from './Comments'
import styles from './styles.less'
import { TextModuleContent } from '~/modules/reports/views/Preview/TextModuleContent'
import QuestionModel from '~/modules/reports/models/Question'
import ModuleModel from '~/modules/reports/models/Module'
import ModuleInterface from '~/modules/reports/core/interfaces/Module'

const { I18n } = window
const { Text } = Typography

type Props = PropsFromRedux & {
  pages: {}[]
  questions?: {[key:string]: {id: number}}
}

export const lookUpModules = (report, visiblePages) => {
  const pages = report.pages.filter(p => _.find(visiblePages, { id: p.id }))
  return _.reduce(pages, (res, page) => {
    const modules = _.reduce(page.modules, (modules, module) => (
      module.type === 'Text' && module.props.editable ? [...modules, module] : modules
    ), [])
    return modules.length ? [...res, { page, modules }] : res
  }, [])
}

function Sidebar ({
  userReport, subscribeSocket, selectModule, selectedModuleId, pages, questions,
}: Props) {
  useEffect(() => {
    subscribeSocket('Comments::Channel', { id: userReport.id })
  }, [])

  const qModels = useMemo(() => _.reduce(
    questions, (acc, q) => ({ ...acc, [q.id]: new QuestionModel(q) }), {},
  ), [questions])

  if (!(userReport && userReport.loaded)) { return null }

  const scrollTo = (id) => {
    ScrollDispatcher.scrollIntoView(id, { offset: 85 })
  }

  const scrollToModule = (id) => {
    scrollTo(`Module_${id}`)
    selectModule(parseInt(id, 10))
  }

  const tag = (override) => {
    if (!override) { return <Tag color="gray">Pending</Tag> }
    return override.approved
      ? (
        <>
          <Tag color="#e6f1f3" style={{ color: '#63a8af' }}>Accepted</Tag>
          <CheckOutlined />
        </>
      )
      : <Tag color="orange">Edited</Tag>
  }

  const pageModules = lookUpModules(userReport.report, pages)
  const approved = userReport.moduleOverrides.filter(m => m.approved).length
  const modulesCount = _.reduce(pageModules, (sum, { modules }) => (sum + modules.length), 0)
  let number = 0

  const showItems = userReport.approvalStatus === ApprovalStatuses.QCInProgress
    || userReport.approvalStatus === ApprovalStatuses.QCCompleted

  return (
    <div className={styles.sidebar}>
      <Tabs className={styles.tabs}>
        {showItems && (
          <Tabs.TabPane tab="Items" key="items">
            <div className={styles.header}>
              <div>
                <span>
                  {I18n.t('common.text.accepted')}
                  {' '}
                  -
                </span>
                {' '}
                {approved}
                /
                {modulesCount}
              </div>
            </div>
            {pageModules.map(({ page, modules }, i) => (
              <div key={i}>
                <div className={cs(styles.override, styles.pageTitle)} onClick={() => scrollTo(`Page#${page.id}`)}>
                  {page.name}
                </div>
                {modules.map((module, j) => {
                  const override = _.find(userReport.moduleOverrides, { moduleId: module.id })
                  const content = override?.content
                    || TextModuleContent.run(new ModuleModel(module, page.id) as unknown as ModuleInterface, qModels)
                  number += 1
                  return (
                    <>
                      <div
                        key={j}
                        className={cs([styles.override, { [styles.selected]: selectedModuleId === module.id }])}
                        onClick={() => scrollToModule(module.id)}
                      >
                        <div className={styles.number}>
                          {number}
                          .
                        </div>
                        <div className={styles.content}>
                          <div className={styles.tag}>
                            {tag(override)}
                            {override ? (
                              <>
                                {' '}
                                {dayjs(override.updatedAt).fromNow()}
                                {' '}
                                by
                                {' '}
                                {override.editor.firstName}
                                {' '}
                                {override.editor.lastName}
                              </>
                            ) : 'Waiting for action'}
                          </div>
                          <div className={styles.text}>
                            {Utils.removeTags(content)}
                          </div>
                        </div>
                      </div>
                      <hr className={styles.divider} />
                    </>
                  )
                })}
              </div>
            ))}
          </Tabs.TabPane>
        )}
        <Tabs.TabPane tab={I18n.t('admin.reports_preview_comments')} key="comments">
          <Comments pageModules={pageModules} scrollToModule={scrollToModule} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={I18n.t('admin.reports_preview_history')} key="history">
          <Space
            orientation="vertical"
            className={styles.events}
            separator={
              <Divider style={{ margin: 0 }} />
          }
          >
            {userReport.userReportEvents.map((reportEvent) => {
              const avatarIcon = reportEvent.initiator.avatarUrl ? null : <UserOutlined />
              return (
                <Row className={styles.event} wrap={false} gutter={[6, 0]} justify="center" align="middle">
                  <Col>
                    <Avatar size={40} icon={avatarIcon} src={reportEvent.initiator.avatarUrl} />
                  </Col>
                  <Col
                    flex={1}
                    className={cs({ [styles.clickable]: reportEvent.details.module })}
                    onClick={
                      (reportEvent.details.module)
                        ? () => scrollTo(`Module_${(reportEvent.details as {module:string}).module}`)
                        : undefined
                      }
                  >
                    <Text className={styles.timestamp} type="secondary">
                      {dayjs(reportEvent.createdAt).fromNow()}
                    </Text>
                    <div className={styles.name}>
                      <b>{reportEvent.initiator.fullName}</b>
                      {' '}
                      <SafeHTML
                        as="span"
                        html={I18n.t(`report_approvals.events.${reportEvent.eventType}`, reportEvent.details)}
                      />
                    </div>
                  </Col>
                </Row>
              )
            })}
          </Space>
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  selectedModuleId: getUserReport(state).selectedModule,
}), {
  approveReport,
  subscribeSocket,
  selectModule,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter(Sidebar)
