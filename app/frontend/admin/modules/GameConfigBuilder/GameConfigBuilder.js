
import React, { useState } from 'react'
import {
  Tabs, Input, Button, message,
} from 'antd'
import _ from 'lodash'
import connect from './connect'
import styles from './styles'

const { TabPane } = Tabs
const { TextArea } = Input

const GameConfigBuilder = ({
  assessmentId, config, translations, saveConfig,
}) => {
  const handleSaveConfig = (key, value) => {
    let parseJson
    try {
      parseJson = JSON.parse(value)
    } catch {
      return message.error('Please provide a valid json string.')
    }
    saveConfig(assessmentId, { [key]: parseJson }).then(() => {
      message.info(`${_.capitalize(key)} updated successfully`)
    })
  }

  return (
    <div className="ms" style={{ background: 'white' }}>
      <Tabs defaultActiveKey="config">
        <TabPane tab="Config" key="config">
          <JSONEditor value={config} onSave={value => handleSaveConfig('config', value)} />
        </TabPane>
        <TabPane tab="Translations" key="translations">
          <JSONEditor value={translations} onSave={value => handleSaveConfig('translations', value)} />
        </TabPane>
      </Tabs>
    </div>
  )
}

function JSONEditor ({ value, onSave }) {
  const [stringifiedValue, setStringifiedValue] = useState(JSON.stringify(value, null, 2))

  return (
    <div className={styles.tabContent}>
      <TextArea rows="25" value={stringifiedValue} onChange={e => setStringifiedValue(e.target.value)} />
      <Button className="mtm" onClick={() => onSave(stringifiedValue)}>Save</Button>
    </div>
  )
}

export default connect(GameConfigBuilder)
