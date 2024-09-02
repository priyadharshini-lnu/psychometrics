import { Radio, Divider } from 'antd'
import _ from 'lodash'
import Modals from '~/modules/admin/components/Modals'
import RouteList from '~/components/RouteList'
// eslint-disable-next-line max-len
import CampaignNameConfirmationModal from '~/modules/admin/modules/threeSixtyCampaign/components/CampaignNameConfirmationModal'
import ResetCampaignModal from '~/modules/admin/modules/threeSixtyCampaign/components/ResetCampaignModal'
import FactorBenchmarkScoreModal from '~/modules/admin/modules/threeSixtyCampaign/components/FactorBenchmarkScoreModal'

import routeUtils from '~/utils/route'
import settings from '../../../settings'
import SubjectList from './SubjectList'
import EvaluatorList from './EvaluatorList'
import ManagerList from './ManagerList'
import ParticipantModal from './ParticipantModal'
import ManageRelationshipsModal from './ManageRelationshipsModal'

const pathToTabName = path => _.last(path.split('/'))

const Lists = ({ history, routes, setSelectedTab }) => {
  const onChange = (e) => {
    const selectedTab = pathToTabName(e.target.value)
    setSelectedTab(selectedTab)
    routeUtils.moveTo(history, settings.urlPrefix, e.target.value)
  }

  setSelectedTab(pathToTabName(routeUtils.getActiveRoutePath(routes)))

  return (
    <div>
      <Radio.Group className="mtl mll" value={routeUtils.getActiveRoutePath(routes)} onChange={onChange}>
        <Radio.Button value="/participants/subjects">Subjects</Radio.Button>
        <Radio.Button value="/participants/evaluators">Evaluators</Radio.Button>
        <Radio.Button value="/participants/managers">Managers</Radio.Button>
      </Radio.Group>
      <Divider />
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
      <ParticipantModal />
      <ManageRelationshipsModal />
      <ResetCampaignModal />
      <CampaignNameConfirmationModal />
      <Modals modals={{
        FactorBenchmarkScoreModal,
      }}
      />
    </div>
  )
}

Lists.SubjectList = SubjectList
Lists.EvaluatorList = EvaluatorList
Lists.ManagerList = ManagerList

export default Lists
