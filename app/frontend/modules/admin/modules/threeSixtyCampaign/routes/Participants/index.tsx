import { Menu } from 'antd'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { useEffect, useState } from 'react'
import RouteList from '~/components/RouteList'
import { get as getCurrentUser } from '~/core/currentUser'
import routeUtils from '~/utils/route'
import settings from '../../settings'
import { PageHeader } from '../../PageHeader'
import Options from './Options'
import SubjectList from './SubjectList'
import EvaluatorList
  from './EvaluatorList'
import ManagerList from './ManagerList'

import styles from './styles.less'

const routes = [
  { redirect: true, from: '', to: 'subjects' },
  { path: '/options', component: <Options /> },
  { path: '/subjects', component: <SubjectList /> },
  { path: '/evaluators', component: <EvaluatorList /> },
  { path: '/managers', component: <ManagerList /> },
]
function Index ({ currentUser }) {
  const [selected, setSelected] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setSelected(`/participants${routeUtils.getActiveRoutePath(routes)}`)
  }, [])

  const onSelect = ({ key }) => {
    setSelected(key)
    routeUtils.moveTo(navigate, settings.urlPrefix, key)
  }
  const menuItems = [
    { key: '/participants/subjects', label: 'Subjects' },
    { key: '/participants/evaluators', label: 'Evaluators' },
    { key: '/participants/managers', label: 'Managers' },
  ]
  currentUser.permissions.editParticipantOptions && menuItems.push({
    key: '/participants/options',
    label: 'Options',
  })
  return (
    <>
      <PageHeader />
      <div>
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={[selected]}
          mode="horizontal"
        />
        <div className={styles.container}>
          <RouteList
            routes={routes}
            urlPrefix=""
          />
        </div>
      </div>
    </>
  )
}

export default connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(Index)
