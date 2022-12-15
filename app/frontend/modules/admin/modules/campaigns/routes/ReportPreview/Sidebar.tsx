import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import { Tag, Tabs } from 'antd'
import {
  getCurrent,
  approveReport,
  Statuses,
} from 'modules/admin/modules/campaigns/core/userReports'
import { subscribeSocket } from 'core/socket'
import Utils from 'modules/reports/utils/Utils'
import moment from 'moment'
import { RootState } from 'modules/admin/core/rootReducers'
import ScrollDispatcher from 'modules/reports/dispatchers/ScrollDispatcher'
import _ from 'lodash'
import { CheckOutlined } from '@ant-design/icons'
import Comments from './Comments'
import styles from './styles.less'

const { I18n } = window

type Props = PropsFromRedux

export const lookUpModules = report => _.reduce(report.pages, (res, page) => {
  const modules = _.reduce(page.modules, (modules, module) => (
    module.type === 'Text' && module.props.editable ? [...modules, module] : modules
  ), [])
  return modules.length ? [...res, { page, modules }] : res
}, [])

function ReportPreview ({
  userReport, subscribeSocket,
}: Props) {
  useEffect(() => {
    subscribeSocket('Comments::Channel', { id: userReport.id })
  }, [])

  const scrollTo = (id) => {
    ScrollDispatcher.scroll(id)
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

  const pageModules = lookUpModules(userReport.report)
  const approved = userReport.moduleOverrides.filter(m => m.approved).length
  const modulesCount = _.reduce(pageModules, (sum, { modules }) => (sum + modules.length), 0)
  let number = 0

  const showItems = userReport.approvalStatus === Statuses.QCInProgress
    || userReport.approvalStatus === Statuses.QCCompleted

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
                  const content = override?.content || module.props.text
                  number += 1
                  return (
                    <>
                      <div
                        key={j}
                        className={cs(styles.override, styles.selected)}
                        onClick={() => scrollTo(`Module_${module.id}`)}
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
                                {moment(override.updatedAt).fromNow()}
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
                            {Utils.stripHTML(content)}
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
        <Tabs.TabPane tab="Comments" key="comments">
          <Comments />
        </Tabs.TabPane>
        <Tabs.TabPane tab="History" key="history">
          History
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
}), {
  approveReport,
  subscribeSocket,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter(ReportPreview)
