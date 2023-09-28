import cs from 'classnames'
import { Button } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import styles from './ResourceManager.less'
import { Tabs } from '../../Header/Tabs'

export default function Header ({
  saveResources, assessmentId, resources, addResource,
}) {
  const save = () => {
    saveResources(assessmentId, resources).then(() => {
      NotificationDispatcher.notify({ message: 'Resources successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  return (
    <div className={`panel-heading ${styles.menu}`}>
      <div className={styles.factorsContainer}>
        <div className="btn-group mrh">
          <button
            onClick={() => addResource()}
            className={cs('btn')}
          >
            Add Resource
          </button>
        </div>

      </div>
      <ul className={cs('panel-controls', styles.controls)}>
        <li>
          <Tabs active="resources" />
        </li>
        <li>
          <Button type="primary" onClick={save}>
            <SaveOutlined />
            {' '}
            Save
          </Button>
        </li>
      </ul>
    </div>
  )
}
