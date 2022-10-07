import React from 'react'
import {
  Button, Menu,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { RootState } from 'modules/admin/core/rootReducers'
import { openModal } from 'modules/admin/core/ui/modals'
import {
  reset as resetCampaign, resetAllNominations, exportCompletionStatuses, rescoreAssessment,
} from 'modules/admin/modules/threeSixtyCampaign/core'
import { get as getCurrentUser } from 'core/currentUser'
import {
  getCurrentAssessmentId, getCurrentReportId, getCurrentDimensionId,
} from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { connect, ConnectedProps } from 'react-redux'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    dimensionId: getCurrentDimensionId(state),
    assessmentId: getCurrentAssessmentId(state),
    reportId: getCurrentReportId(state),
    currentUser: getCurrentUser(state),
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
  openModal, dimensionId, reportId, assessmentId, currentUser,
}) => (
  <ConditionalDropdown
    menu={menu({
      openModal,
      dimensionId,
      reportId,
      assessmentId,
      currentUser,
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

const menu = ({
  dimensionId, reportId, assessmentId, openModal, currentUser,
}) => (
  <Menu>
    {currentUser.permissions.editDimension && (
      <Menu.Item key="dimension">
        <a href={`/administration/dimensions/${dimensionId}/factors`} role="button" tabIndex={-1}>
          {I18n.t('administration.threesixty_campaigns.manage.dimension')}
        </a>
      </Menu.Item>
    )}
    {currentUser.permissions.editReport && (
      <Menu.Item key="report">
        <a href={`/administration/reports/${reportId}`} role="button" tabIndex={-1}>
          {I18n.t('administration.threesixty_campaigns.manage.report')}
        </a>
      </Menu.Item>
    )}
    {currentUser.permissions.editAssessment && (
      <Menu.Item key="assessment">
        <a href={`/administration/assessments/${assessmentId}`} role="button" tabIndex={-1}>
          {I18n.t('administration.threesixty_campaigns.manage.assessment')}
        </a>
      </Menu.Item>
    )}
    {currentUser.permissions.manageRelationships && (
      <Menu.Item key="manage_relationship">
        <a onClick={() => openModal('ManageRelationshipsModal')} role="button" tabIndex={-1}>
          {I18n.t('administration.threesixty_campaigns.manage.manage_relationships')}
        </a>
      </Menu.Item>
    )}
  </Menu>
)

export const Manage = connector(ManageComponent)
