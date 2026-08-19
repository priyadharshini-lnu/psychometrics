import { FC } from 'react'
import {
  Drawer, Row, Descriptions,
} from 'antd'

const { I18n } = window

export interface AssessorDrawerAssessment {
  id: number | string
  campaignAssessmentId?: number | string
  assessmentName?: string | null
  name?: string | null
  owner?: {
    id: number | string
    name: string | null
  } | null
  dimensionId?: number | string | null
}

interface Props {
  close: () => void
  assessorAssessment: AssessorDrawerAssessment | undefined
}

export const DetailsDrawer: FC<Props> = ({
  close,
  assessorAssessment,
}) => {
  if (!assessorAssessment) {
    return null
  }

  return (
    <Drawer
      title={I18n.t('admin.assessor_assessment_drawer_title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.assessment_name')}
            key="name"
            className="va-t"
          >
            {assessorAssessment.assessmentName || assessorAssessment.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.owner')}
            key="owner"
            className="va-t"
          >
            {assessorAssessment.owner?.name || I18n.t('admin.platform_owner')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.dimension_id')}
            key="dimension_id"
            className="va-t"
          >
            {assessorAssessment.dimensionId ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      </Row>
    </Drawer>
  )
}
