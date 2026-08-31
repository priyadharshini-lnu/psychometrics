import { Modal, Tabs } from 'antd'
import { connect } from 'react-redux'
import { RootState } from '~/modules/reports/core/rootReducers'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { isAiAssistantEnabled } from '~/modules/reports/utils/features'
import { PageSettings } from './PageSettings'
import { Translations } from './Translations'
import { CampaignFactors } from './CampaignFactors'
import { CampaignAIArtifacts } from './CampaignAIArtifacts'
import { DataSheets } from './DataSheets'

const { I18n } = window

interface ReportSettingsComponentProps {
  close: () => void;
}

export const ReportSettingsComponent = ({
  close,
}: ReportSettingsComponentProps) => {
  const tabItems = [
    {
      label: I18n.t('administration.report_settings.tabs.page_settings'),
      key: 'page_settings',
      children: <PageSettings />,
    },
    {
      label: I18n.t('administration.report_settings.tabs.translations'),
      key: 'translations',
      children: <Translations />,
    },
    {
      label: I18n.t('administration.report_settings.tabs.campaign_factors'),
      key: 'campaign_factors',
      children: <CampaignFactors />,
    },
    {
      label: I18n.t('administration.report_settings.tabs.data_sheets'),
      key: 'data_sheets',
      children: <DataSheets />,
    },
  ]

  if (isAiAssistantEnabled()) {
    tabItems.push({
      label: I18n.t('administration.report_settings.tabs.campaign_ai_artifacts'),
      key: 'campaign_ai_artifacts',
      children: <CampaignAIArtifacts />,
    })
  }

  return (
    <Modal
      title={I18n.t('administration.report_settings.title')}
      open
      footer={null}
      onCancel={close}
      mask={{ closable: false }}
      width={1000}
    >
      <Tabs
        defaultActiveKey="page_settings"
        tabPlacement="start"
        items={tabItems}
      />
    </Modal>
  )
}

export const ReportSettings = connect(
  (state:RootState) => ({
    ...getData(state.report).reportSettings,
    reportSettings: getData(state.report).reportSettings,
    reportId: getData(state.report).reportId,
  }),
  {
    close: () => closeModal('reportSettings'),
  },
)(ReportSettingsComponent)
