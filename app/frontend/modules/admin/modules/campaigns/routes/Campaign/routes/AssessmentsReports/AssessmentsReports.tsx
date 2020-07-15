import React, { useEffect } from 'react'
import { Row, Col, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { State as ReportState } from 'modules/admin/modules/campaigns/core/reports'
import Modals from 'modules/admin/components/Modals/'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import AddReportModal from './AddReportModal'
import styles from './styles.scss'

const MODALS = {
  AddReportModal,
}

interface Props {
  fetchAssessmentAndReports(campaignId: string): void
  reports: ReportState
  match: {
    params: {
      campaignId: string
    }
  },
  openModal(name: string, data?: { campaignId: number }): void
}

const AssessmentsReports: React.FC<Props> = ({
  fetchAssessmentAndReports,
  match: { params: { campaignId } },
  openModal,
}) => {
  useEffect(() => {
    fetchAssessmentAndReports(campaignId)
  }, [])
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <h3>Reports</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Button
              type="primary"
              onClick={() => openModal('AddReportModal', { campaignId: parsedCampaignId })}
            >
              <PlusOutlined />
              <span>Add Report</span>
            </Button>
          </div>
        </div>
      </Row>
      <div className="pm">
        <ReportList />
        <div className={styles.tableDivider} />
        <h3>Assessments</h3>
        <AssessmentList />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export default AssessmentsReports
