import React, { useState } from 'react'
import {
  Button, Table, MenuProps, App,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MessageInstance } from 'antd/es/message/interface'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import {
  rescoreResponses, exportRawResults, exportScoringResults, exportNormedResults,
  exportRawFactorScores, exportExternalResults,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getAssessorAssessment } from '~/modules/admin/modules/campaigns/core/campaignAssessorAssessments'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { AssessorDrawerAssessment, DetailsDrawer } from '../AssessorAssessmentList/DetailsDrawer'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessorAssessment(state),
  }),
  {
    rescoreResponses,
    exportRawResults,
    exportScoringResults,
    exportNormedResults,
    exportRawFactorScores,
    exportExternalResults,
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>

const { Column } = Table
const { I18n } = window

type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments,
  rescoreResponses,
  openModal,
  exportRawResults,
  exportScoringResults,
  exportNormedResults,
  exportRawFactorScores,
  exportExternalResults,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const screens = useBreakpoint()
  const { message } = App.useApp()
  const [selectedAssessment, setSelectedAssessment] = useState<AssessorDrawerAssessment | undefined>(undefined)

  return (
    <>
      <TableLayout
        embedded
        title={I18n.t('admin.other_assessor_assessments')}
        recordCount={assessments.length}
        table={(
          <Table
            rowKey="id"
            dataSource={assessments}
            pagination={false}
            scroll={{ x: 'max-content' }}
            sticky
            onRow={getTenantRowAttributes}
          >
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="id"
              key="id"
              fixed={screens.md ? 'left' : undefined}
            />
            <Column
              title={I18n.t('campaign_assessment.column.assessment_name')}
              key="name"
              width={300}
              fixed={screens.md ? 'left' : undefined}
              render={assessment => (
                <Button type="link" size="small" className="p-0" onClick={() => setSelectedAssessment(assessment)}>
                  {assessment.name}
                </Button>
              )}
            />
            <Column
              title={I18n.t('common.column.linked_assessment')}
              key="linkedAssessment"
              width={200}
              render={({ linkedAssessmentName }) => linkedAssessmentName || I18n.t('common.text.na')}
            />
            <Column
              title={I18n.t('common.column.action')}
              key="action"
              fixed={screens.md ? 'right' : undefined}
              render={assessment => (
                <ConditionalDropdown
                  menu={
                  getActionsMenuProps({
                    assessment,
                    openModal,
                    campaignId: parsedCampaignId,
                    rescoreResponses: () => rescoreResponses(parsedCampaignId, assessment.id),
                    exportRawResults,
                    exportScoringResults,
                    exportNormedResults,
                    exportRawFactorScores,
                    exportExternalResults,
                    message,
                  })
                }
                />
              )}
            />
          </Table>
        )}
      />
      {!!selectedAssessment && (
        <DetailsDrawer
          close={() => setSelectedAssessment(undefined)}
          assessorAssessment={selectedAssessment}
        />
      )}
    </>
  )
}

interface ActionMenuData {
  campaignId: number
  assessment: Assessment
  openModal(name: string, data?: {
    projectId?: number, assessment?: Assessment,
    campaignId: number, campaignAssessmentId: number
  }): void
  rescoreResponses(): void
  exportRawResults: Props['exportRawResults']
  exportScoringResults: Props['exportScoringResults']
  exportNormedResults: Props['exportNormedResults']
  exportRawFactorScores: Props['exportRawFactorScores']
  exportExternalResults: Props['exportExternalResults']
  message: MessageInstance
}

const getActionsMenuProps = ({
  campaignId, assessment, openModal, rescoreResponses, exportRawResults,
  exportScoringResults, exportNormedResults, exportRawFactorScores,
  exportExternalResults, message,
}: ActionMenuData): MenuProps => {
  const { id, name, permissions } = assessment

  const handleRescoreResponse = () => {
    rescoreResponses()
    message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
  }

  const handleRawExport = (with_labels: boolean) => {
    exportRawResults(campaignId, id, { with_labels }).then(() => {
      message.success(I18n.t('campaign_assessment.messages.raw_results_export_scheduled'))
    })
  }

  const handleScoringExport = () => {
    exportScoringResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.scoring_results_export_scheduled'))
    })
  }

  const handleNormedResultExport = () => {
    exportNormedResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.norm_results_export_scheduled'))
    })
  }

  const handleRawFactorExport = () => {
    exportRawFactorScores(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.raw_factor_export_scheduled'))
    })
  }

  const handleExternalResultExport = () => {
    exportExternalResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.external_results_export_scheduled'))
    })
  }

  const exportGroupItems: MenuItem[] = []
  permissions.exportRawResults && exportGroupItems.push({
    key: 'export_raw_labels',
    label: 'Raw (with labels)',
  })
  permissions.exportRawResults && exportGroupItems.push({
    key: 'export_raw',
    label: 'Raw (without labels)',
  })
  permissions.exportScoringResults && exportGroupItems.push({
    key: 'export_scoring',
    label: 'Scoring',
  })
  permissions.exportNormedResults && exportGroupItems.push({
    key: 'export_normed',
    label: 'Normed Factor Scores',
  })
  permissions.exportRawFactorScores && exportGroupItems.push({
    key: 'export_raw_scores',
    label: 'Raw Factor Scores',
  })
  permissions.exportExternalResults && exportGroupItems.push({
    key: 'export_external',
    label: 'External',
  })

  const importGroupItems: MenuItem[] = [
    { key: 'import_raw', label: 'Raw' },
    { key: 'import_scoring', label: 'Scoring' },
  ]

  const rescoreMenuItems:MenuItem[] = [
    { type: 'divider' },
    { key: 'rescoring', label: I18n.t('campaign_assessment.modals.rescore_response.title') },
  ]

  const menuItems: MenuItem[] = [{
    type: 'group', key: 'export', label: 'Export', children: exportGroupItems,
  }]
  permissions.importResults && menuItems.push({
    type: 'group',
    key: 'import',
    label: 'Import',
    children: importGroupItems,
  })
  permissions.rescoreResponses && menuItems.push(...rescoreMenuItems)

  const handleMenuClick = ({ key }) => {
    if (key === 'export_raw_labels') {
      return handleRawExport(true)
    }
    if (key === 'export_raw') {
      return handleRawExport(false)
    }
    if (key === 'export_scoring') {
      return handleScoringExport()
    }
    if (key === 'export_normed') {
      return handleNormedResultExport()
    }
    if (key === 'export_raw_scores') {
      return handleRawFactorExport()
    }
    if (key === 'export_external') {
      return handleExternalResultExport()
    }
    if (key === 'import_raw') {
      return openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'import_scoring') {
      return openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'import_external_scoring') {
      return openModal('ImportExternalScoringModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'rescoring') {
      return handleRescoreResponse()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default connecter(AssessmentList)
