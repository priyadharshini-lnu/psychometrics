import { Modal, Tabs } from 'antd'
import { connect } from 'react-redux'
import { RootState } from '~/modules/reports/core/rootReducers'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { PageSettings } from './PageSettings'
import { Translations } from './Translations'
import { CampaignFactors } from './CampaignFactors'

export const ReportSettingsComponent = ({ close }) => (
  <Modal
    title="Report Settings"
    open
    footer={null}
    onCancel={close}
    maskClosable={false}
    width={1000}
  >
    <Tabs
      defaultActiveKey="page_settings"
      tabPosition="left"
      style={{ height: 400 }}
      items={[
        {
          label: 'Page Settings',
          key: 'page_settings',
          children: <PageSettings />,
        },
        {
          label: 'Translations',
          key: 'translations',
          children: <Translations />,
        },
        {
          label: 'Campaign Factors',
          key: 'campaign_factors',
          children: <CampaignFactors />,
        },
      ]}
    />
  </Modal>
)

export const ReportSettings = connect(
  (state:RootState) => ({
    ...getData(state.report).reportSettings,
  }),
  {
    close: () => closeModal('reportSettings'),
  },
)(ReportSettingsComponent)
