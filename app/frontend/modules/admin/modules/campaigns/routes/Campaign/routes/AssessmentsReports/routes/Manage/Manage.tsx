import React, { useEffect } from 'react'
import {
  Row, Col, Button, Space, message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Modals from 'modules/admin/components/Modals/'
import { RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import AddReportModal from './AddReportModal'
import { Strategies } from './AddReportModal/interfaces'
import UniversalLinkModal from './UniversalLinkModal'
import ImportRawModal from './ImportRawModal'
import UpdateNormModal from './UpdateNormModal'
import ImportScoringModal from './ImportScoringModal'
import RemoveReportModal from './RemoveReportModal'
import ToggleUserAccessModal from './ToggleUserAccessModal'
import { PropsFromRedux } from './connect'
import styles from './styles.scss'

const MODALS = {
  AddReportModal,
  UniversalLinkModal,
  ImportRawModal,
  ImportScoringModal,
  UpdateNormModal,
  RemoveReportModal,
  ToggleUserAccessModal,
}

const { I18n } = window

interface Params {
  campaignId: string
}

type Props = PropsFromRedux & RouteComponentProps<Params>

const Manage: React.FC<Props> = ({
  fetchAssessmentAndReports,
  match: { params: { campaignId } },
  openModal,
  selectedIds,
  regenerateReports,
  regenerateInProgress,
}) => {
  useEffect(() => {
    fetchAssessmentAndReports(campaignId)
  }, [])
  const parsedCampaignId = parseInt(campaignId, 10)

  const handleRegenerateReports = () => {
    regenerateReports(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <h3>Reports</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              <Button
                type="default"
                onClick={handleRegenerateReports}
                disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                loading={regenerateInProgress}
              >
                <span>{I18n.t('user_reports.actions.regenerate')}</span>
              </Button>
              <Button
                type="primary"
                onClick={
                  () => openModal('AddReportModal', { campaignId: parsedCampaignId, strategy: Strategies.MULTIPLE })
                }
              >
                <PlusOutlined />
                <span>Add Report</span>
              </Button>
            </Space>
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

export default Manage
