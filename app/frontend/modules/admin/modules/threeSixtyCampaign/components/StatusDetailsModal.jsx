import { useEffect, useState } from 'react'
import {
  Modal, Descriptions, Tag,
} from 'antd'
import { useParams } from 'react-router-dom'
import {
  InfoOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

function StatusDetailsModal ({ close, subjectData }) {
  const [statusMessage, setStatusMessage] = useState(null)
  const { campaignId } = useParams()
  const baseUrl = `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectData.id}`
  const url = `${baseUrl}/report_status_message?status=${subjectData.reportStatus}`


  useEffect(() => {
    if (subjectData?.id && subjectData?.reportStatus) {
      fetchStatusMessage()
    }
  }, [subjectData?.id, subjectData?.reportStatus])

  const fetchStatusMessage = async () => {
    try {
      const response = await fetch(url)
      const data = await response.json()
      setStatusMessage(data.status_message)
    } catch (error) {
      console.error('Error fetching status message:', error)
    }
  }

  if (!subjectData) return null

  const {
    reportStatus,
    availableReportLanguages,
    status: evaluationStatus,
    evaluators,
    evaluations,
    evaluationMarkedDoneBy,
    user,
  } = subjectData

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
      case 'completed':
      case 'done':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'not_available':
      case 'incomplete':
      case 'not_completed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'denied':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <InfoOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
      case 'completed':
      case 'done':
        return 'success'
      case 'not_available':
      case 'incomplete':
      case 'not_completed':
      case 'denied':
        return 'error'
      case 'on_hold':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Modal
      title={`Status Details - ${user?.firstName} ${user?.lastName}`}
      open
      onCancel={close}
      footer={null}
      width={850}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item
          label={I18n.t('admin.report_status')}
        >
          <div>
            <Tag
              color={getStatusColor(reportStatus)}
              icon={getStatusIcon(reportStatus)}
              className="mb-2"
            >
              {I18n.t(`reports.statuses.${reportStatus}`)}
            </Tag>
            {statusMessage && (
              <div style={{ marginTop: '8px', color: '#8c8c8c', fontSize: '14px' }}>
                {statusMessage}
              </div>
            )}
            {availableReportLanguages && availableReportLanguages.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                  {I18n.t('admin.available_languages')}
                  :
                </div>
                {availableReportLanguages.map(locale => (
                  <Tag key={locale}>
                    {I18n.t(`languages.${locale}`, { defaultValue: locale.toUpperCase() })}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </Descriptions.Item>

        <Descriptions.Item
          label={I18n.t('admin.evaluation_status')}
        >
          <div>
            <Tag
              color={getStatusColor(evaluationStatus)}
              icon={getStatusIcon(evaluationStatus)}
              className="mb-2"
            >
              {I18n.t(`admin.${evaluationStatus}`)}
            </Tag>
            {evaluators && evaluations && (
              <div style={{ marginTop: '8px', color: '#8c8c8c', fontSize: '14px' }}>
                {(() => {
                  const [completedEvaluators, totalEvaluators] = evaluators.split(' / ').map(Number)

                  switch (evaluationStatus) {
                    case 'completed':
                      return I18n.t('admin.completed_tooltip', { completed: completedEvaluators })
                    case 'not_completed':
                      return I18n.t('admin.not_completed_tooltip', {
                        completed: totalEvaluators,
                        submitted: completedEvaluators,
                      })
                    case 'done':
                      return (
                        <div>
                          {I18n.t('admin.done_tooltip', { marked_by: evaluationMarkedDoneBy || 'Unknown' })}
                        </div>
                      )
                    case 'nothing_assigned':
                      return I18n.t('admin.nothing_assigned_tooltip')
                    default:
                      return null
                  }
                })()}
              </div>
            )}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

export default StatusDetailsModal
