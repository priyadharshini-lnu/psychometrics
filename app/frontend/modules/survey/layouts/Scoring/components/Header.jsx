import { Component } from 'react'
import cs from 'classnames'
import { Button, Radio } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { RECODING, SCORING } from '~/modules/survey/constants/scoring'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import FactorsMenu from './FactorsMenu'
import styles from './Scoring.less'
import { Tabs } from '../../Header/Tabs'

export default class Header extends Component {
  save = () => {
    const {
      saveScoring, assessmentId, factors, recoding,
    } = this.props
    saveScoring(assessmentId, factors, recoding).then(() => {
      NotificationDispatcher.notify({ message: 'Scoring successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  render () {
    const { selectedFactor, updateType, type } = this.props
    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div className={styles.factorsContainer}>
          <Radio.Group
            className="mrm"
            onChange={({ target: { value } }) => updateType(value)}
            defaultValue={SCORING}
            value={type}
            buttonStyle="solid"
          >
            <Radio.Button value={SCORING}>Scoring</Radio.Button>
            <Radio.Button value={RECODING}>Recoding</Radio.Button>
          </Radio.Group>
          {selectedFactor && type === SCORING && <FactorsMenu {...this.props} />}
        </div>
        <ul className={cs('panel-controls', styles.controls)}>
          <li><Tabs active="scoring" /></li>
          <li>
            <Button type="primary" onClick={this.save}>
              <SaveOutlined />
              {' '}
              Save
            </Button>
          </li>
        </ul>
      </div>
    )
  }
}
