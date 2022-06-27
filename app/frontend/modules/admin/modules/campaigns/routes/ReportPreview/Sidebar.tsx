import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import { Tag, Button } from 'antd'
import {
  getCurrent,
  approveReport,
} from 'modules/admin/modules/campaigns/core/userReports'
import Utils from 'modules/reports/utils/Utils'
import moment from 'moment'
import { RootState } from 'modules/admin/core/rootReducers'
import ScrollDispatcher from 'modules/reports/dispatchers/ScrollDispatcher'
import _ from 'lodash'
import { CheckOutlined } from '@ant-design/icons'
import styles from './styles.less'

const { I18n } = window

type Props = PropsFromRedux

const lookUpModules = report => _.reduce(report.pages, (res, page) => {
  const modules = _.reduce(page.modules, (modules, module) => (
    module.type === 'Text' && module.props.editable ? [...modules, module] : modules
  ), [])
  return modules.length ? [...res, { page, modules }] : res
}, [])

function ReportPreview ({
  userReport, approveReport, permissions,
}: Props) {
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

  const pgaeModules = lookUpModules(userReport.report)
  const approved = userReport.moduleOverrides.filter(m => m.approved).length
  const modulesCount = _.reduce(pgaeModules, (sum, { modules }) => (sum + modules.length), 0)
  let number = 0

  return (
    <div className={styles.sidebar}>
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
        {permissions.approveReport && (
          <Button
            disabled={userReport.approved || approved !== modulesCount}
            onClick={() => approveReport(userReport.campaignId, userReport.id)}
            key="download"
          >
            {userReport.approved ? I18n.t('common.text.approved') : I18n.t('common.text.approve')}
          </Button>
        )}
      </div>
      {pgaeModules.map(({ page, modules }, i) => (
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
    </div>
  )
}

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  permissions: state.currentUser.permissions,
}), {
  approveReport,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter(ReportPreview)
