import { Menu } from 'antd'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'


import { useEffect } from 'react'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import { set as setSelectedTab, get as getSelectedTab } from '../../core/selectedParticipantTab'
import {
  get as getCurrentCampaign,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import routeUtils from '~/utils/route'
import settings from '../../settings'
import { PageHeader } from '../../PageHeader'
import CampaignNameConfirmationModal from '../../components/CampaignNameConfirmationModal'
import ResetCampaignModal from '../../components/ResetCampaignModal'
import ManageRelationshipsModal from './ManageRelationshipsModal'
import ParticipantModal from './ParticipantModal'
import Options from './Options'
import SubjectList from './SubjectList'
import EvaluatorList
  from './EvaluatorList'
import ManagerList from './ManagerList'
import Modals from '~/modules/admin/components/Modals'
import FactorBenchmarkScoreModal from '~/modules/admin/modules/threeSixtyCampaign/components/FactorBenchmarkScoreModal'

import styles from './styles.less'
import ImportRawModal from './ImportRawModal'
import BulkDownloadModal from '../../components/BulkDownloadModal'
import RegenerateReportModal from '../../components/RegenerateReportModal'
import DownloadIndividualReportModal from '~/components/DownloadIndividualReportModal'
import CreateSubjectModal from './SubjectList/CreateSubjectModal'
import ConvertOrCopyAsTemplateModal from './ConvertOrCopyAsTemplateModal'
import StatusDetailsModal from '../../components/StatusDetailsModal'

const MODALS = {
  FactorBenchmarkScoreModal,
  ImportRawModal,
  BulkDownloadModal,
  RegenerateReportModal,
  CreateSubjectModal,
  DownloadIndividualReportModal,
  ConvertOrCopyAsTemplateModal,
  StatusDetailsModal,
  ParticipantModal,
}

const routes = [
  { redirect: true, from: '', to: 'subjects' },
  { path: '/options', component: <Options /> },
  { path: '/subjects', component: <SubjectList /> },
  { path: '/evaluators', component: <EvaluatorList /> },
  { path: '/managers', component: <ManagerList /> },
]

const { I18n } = window

function Index ({ setSelectedTab, selectedTab, campaignPermissions }) {
  const navigate = useNavigate()

  useEffect(() => {
    setSelectedTab(`/participants${routeUtils.getActiveRoutePath(routes)}`)
  }, [])

  const onSelect = ({ key }) => {
    setSelectedTab(key)
    routeUtils.moveTo(navigate, settings.urlPrefix, key)
  }
  const menuItems = [
    {
      key: '/participants/subjects',
      label: I18n.t('admin.subjects_title'),
    },
    {
      key: '/participants/evaluators',
      label: I18n.t('admin.evaluators_title'),
    },
    {
      key: '/participants/managers',
      label: I18n.t('admin.managers_title'),
    },
  ]
  campaignPermissions.editParticipantOptions && menuItems.push({
    key: '/participants/options',
    label: I18n.t('admin.options_title'),
  })
  return (
    <>
      <PageHeader />
      <div>
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={[selectedTab]}
          mode="horizontal"
        />
        <div className={styles.container}>
          <RouteList
            routes={routes}
            urlPrefix=""
          />
        </div>
        <ManageRelationshipsModal />
        <ResetCampaignModal />
        <CampaignNameConfirmationModal />
        <Modals modals={MODALS} />
      </div>
    </>
  )
}

const connector = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
    selectedTab: getSelectedTab(state),
  }),
  {
    setSelectedTab,
  },
)


export default connector(Index)
