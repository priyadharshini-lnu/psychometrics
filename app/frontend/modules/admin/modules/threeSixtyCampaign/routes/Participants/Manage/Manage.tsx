import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  reset as resetCampaign, resetAllNominations, exportCompletionStatuses, rescoreAssessment,
} from '~/modules/admin/modules/threeSixtyCampaign/core'
import {
  get as getCurrentCampaign, getCurrentAssessmentId, getCurrentReportId, getCurrentDimensionId,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    campaignId: getCurrentCampaign(state).id,
    dimensionId: getCurrentDimensionId(state),
    assessmentId: getCurrentAssessmentId(state),
    reportId: getCurrentReportId(state),
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
  {
    resetCampaign, resetAllNominations, openModal, exportCompletionStatuses, rescoreAssessment,
  },
)

interface OwnProps {
  openModal(name: string, data?: { campaignId: string }): void
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

export const ManageComponent: React.FC<Props> = ({
  openModal, campaignId, dimensionId, reportId, assessmentId, campaignPermissions,
}) => (
  <ConditionalDropdown
    menu={getMenuProps({
      openModal,
      campaignId,
      dimensionId,
      reportId,
      assessmentId,
      campaignPermissions,
    })}
    className="mrm"
    hideForEmptyMenu
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>
          {I18n.t('administration.threesixty_campaigns.manage.title')}
        </span>
        <DownOutlined />
      </Button>
    )}
  />
)

const getMenuProps = ({
  campaignId, dimensionId, reportId, assessmentId, openModal, campaignPermissions,
}):MenuProps => {
  const menuItems = [
    campaignPermissions.editDimension && {
      key: 'dimension',
      label: (
        <a href={`/administration/dimensions/${dimensionId}/factors`}>
          {I18n.t('administration.threesixty_campaigns.manage.dimension')}
        </a>),
    },
    campaignPermissions.editReport && {
      key: 'report',
      label: (
        <a href={`/administration/reports/${reportId}`}>
          {I18n.t('administration.threesixty_campaigns.manage.report')}
        </a>),
    },
    campaignPermissions.editAssessment && {
      key: 'assessment',
      label: (
        <a href={`/administration/assessments/${assessmentId}`}>
          {I18n.t('administration.threesixty_campaigns.manage.assessment')}
        </a>),
    },
    campaignPermissions.manageRelationships && {
      key: 'manage_relationship',
      label: I18n.t('administration.threesixty_campaigns.manage.manage_relationships'),
    },
    { type: 'divider' },
    (campaignPermissions.manageFactorBenchmarkScores || campaignPermissions.viewFactorBenchmarkScores) && {
      key: 'factor_benchmark_score',
      label: I18n.t('campaign_assessment.actions.factor_benchmark_score'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'manage_relationship') {
      openModal('ManageRelationshipsModal')
    }
    if (key === 'factor_benchmark_score') {
      return openModal('FactorBenchmarkScoreModal', { campaignId, dimensionId, permissions: campaignPermissions })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const Manage = connector(ManageComponent)
