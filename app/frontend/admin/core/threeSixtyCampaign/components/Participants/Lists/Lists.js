import React from 'react'
import { Radio, Divider } from 'antd'
import routeUtils from 'utils/routeUtils'
import RouteList from 'components/RouteList'
import _ from 'lodash'
import settings from '../../../settings'
import SubjectList from './SubjectList'
import EvaluatorList from './EvaluatorList'
import ManagerList from './ManagerList'
import ParticipantModal from './ParticipantModal'

const Lists = ({ history, routes }) => {
  const pathToTabName = path => _.last(path.split('/'))

  const onChange = e => routeUtils.moveTo(history, settings.urlPrefix, `${e.target.value}`)

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
    </div>
  )
}

Lists.SubjectList = SubjectList
Lists.EvaluatorList = EvaluatorList
Lists.ManagerList = ManagerList

export default Lists
