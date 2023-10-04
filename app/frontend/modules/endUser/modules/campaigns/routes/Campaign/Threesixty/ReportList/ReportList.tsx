import _ from 'lodash'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Modal, Progress, Tooltip, Typography, Row, Checkbox,
} from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'

import userPresenter from '~/presenters/user'
import { getSubjectReport, getApprovalReports } from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import { SafeHTML } from '~/components/SafeHTML'
import { ConfirmationModal, CollapseItem } from '~/glint'
import { ThreesixtyCard } from '../ThreesixtyCard'
import styles from '../ListStyles.less'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  approvalReports: getApprovalReports(state.campaigns),
  reportsCounters: state.campaigns.campaign.reportsCounters,
  subjectReport: getSubjectReport(state.campaigns),
  options: state.campaigns.campaign.options.reports,
  instructions: state.campaigns.campaign.instructions,
}), {})

const { I18n } = window
const { Title } = Typography

const ReportListComponent = ({
  approvalReports, subjectReport, percent, reportsCounters,
  options: { approval: { managerApprovesReports } },
  instructions,
}) => {
  const [showHelp, setShowHelp] = useState(false)
  const reportHelp = _.find(instructions, { name: 'report_help' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportToShow, setReportToShow] = useState<Record<string, any> | null>(null)
  const history = useHistory()

  const redirectToReport = (report) => {
    history.push(`/threesixty_campaigns/${report.campaignId}/reports/${report.id}`)
  }

  const showReport = (report) => {
    if (report.evalautionCompletedForSubject) {
      redirectToReport(report)
    } else {
      setReportToShow(report)
    }
  }

  return (
    <>
      {reportToShow && (
      <ConfirmationModal
        title={I18n.t('threesixty.close_evaluation_modal.title')}
        message={I18n.t('threesixty.close_evaluation_modal.message',
          {
            pronoun_or_name:
            reportToShow.isSelf ? I18n.t('threesixty.you') : userPresenter.getFullName(reportToShow.user),
          })
        }
        onConfirm={() => redirectToReport(reportToShow)}
        onCancel={() => setReportToShow(null)}
      />
      )}
      <ThreesixtyCard
        title={<Title level={5}>{I18n.t('threesixty.reports')}</Title>}
        helpIcon={reportHelp && (
          <div>
            <QuestionCircleOutlined onClick={() => setShowHelp(true)} />
          </div>
        )}
      >
        <Row wrap={false}>
          <Progress
            className={styles.progressBar}
            percent={percent}
            showInfo={false}
          />
          <span className={styles.count}>
            {I18n.t('threesixty.progress_text', {
              completed: reportsCounters.completedReports,
              total: reportsCounters.totalReports,
            })}
          </span>
        </Row>
        {subjectReport
          && (
          <Checkbox
            checked={!subjectReport.approved}
            onClick={() => showReport(subjectReport)}
          >
            <span className={styles.subjectLabel}>{I18n.t('threesixty.view_my_report')}</span>
          </Checkbox>
          )}

        {approvalReports.length > 0
          && (
          <CollapseItem
            title={managerApprovesReports ? I18n.t('threesixty.approve_reports') : I18n.t('threesixty.view_reports')}
            list={approvalReports}
          >
            {item => (
              <ReportItem
                item={item}
                showReport={() => showReport(item)}
                managerApprovesReports={managerApprovesReports}
              />
            )}
          </CollapseItem>
          )}
        {reportHelp && (
        <Modal
          title={(
            <>
              {I18n.t('threesixty.reports_help_modal.title')}
            </>
          )}
          open={showHelp}
          onCancel={() => setShowHelp(false)}
          footer={null}
        >
          <SafeHTML html={reportHelp.content} config="adminRichText" />
        </Modal>
        )}
      </ThreesixtyCard>
    </>
  )
}

const ReportItem = ({ item, showReport, managerApprovesReports }) => (
  <Tooltip placement="topLeft" title={item.user.email} key={item.user.email}>
    <Checkbox
      checked={!managerApprovesReports || item.approvalStatus === 'approved'}
      onClick={showReport}
    >
      <span className={styles.subjectLabel}>{userPresenter.selfUserName(item)}</span>
    </Checkbox>
  </Tooltip>
)

export const ReportList = connector(ReportListComponent)
