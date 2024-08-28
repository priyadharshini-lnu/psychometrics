import React from 'react'
import {
  Button, Modal,
} from 'antd'
import { Link } from 'react-router-dom'
import WizardIsRequired from '~/modules/endUser/core/WizardIsRequired'
import { AssessmentExtra } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

const { I18n } = window

interface Props {
  show: boolean
  close(): void
  evaluation: {
    campaignId: number
    assessmentId: number
    assessmentExtra: AssessmentExtra
    id: number
  }
}

export const EditEvaluationModal: React.FC<Props> = ({
  show, close, evaluation: item,
}) => {
  if (!show) { return null }

  const getViewPath = () => `/threesixty_campaigns/${item.campaignId}/evaluations/${item.id}?read=true`

  const getEditPath = () => {
    if (WizardIsRequired.run(item.assessmentExtra, item.id)) {
      return `/system_checks/${item.assessmentId}/${item.id}?mode=edit`
    }
    return `/threesixty_campaigns/${item.campaignId}/evaluations/${item.id}?edit=true`
  }

  return (
    <Modal
      title={I18n.t('campaign.edit_evaluation.title')}
      open={show}
      onCancel={close}
      footer={(
        <div>
          <Link to={getViewPath()} style={{ marginRight: 8 }}>
            <Button type="primary">
              {I18n.t('campaign.edit_evaluation.view')}
            </Button>
          </Link>
          <Link to={getEditPath()}>
            <Button danger>
              {I18n.t('campaign.edit_evaluation.edit')}
            </Button>
          </Link>
        </div>
      )}
    >
      {I18n.t('campaign.edit_evaluation.body')}
    </Modal>
  )
}
