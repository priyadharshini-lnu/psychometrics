
import { useState, useRef } from 'react'
import {
  Tabs, Button, message,
} from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import Ajv from 'ajv'
import schema from '@thetalententerprise/interactive-assessments/dist/schema.json'
import { useSelector } from 'react-redux'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'

import '~/styles/utils.less'

import { useTimeout } from '~/hooks/useTimeout'
import connect from './connect'
import styles from './styles.less'

const { TabPane } = Tabs

const AgileConfigBuilder = ({
  assessmentId, config, translations, saveConfig,
}) => {
  const extra = useSelector(state => state.settings.extra)
  const handleSaveConfig = (key, value) => {
    let parseJson

    try {
      parseJson = JSON.parse(value)
    } catch {
      message.error('Please provide a valid json string.')
      return
    }

    const ajv = new Ajv()
    ajv.addSchema(schema, 'schema')

    const validate = key === 'config'
      ? ajv.getSchema('schema')
      : ajv.getSchema('schema#/definitions/ILocaleConfig/properties/translations')
    const valid = validate(parseJson)

    if (!valid) {
      message.error('Invalid configuration')
      console.error(validate.errors)
      return
    }
    saveConfig(assessmentId, { [key]: parseJson, extra }).then(() => {
      message.info(`${_.capitalize(key)} updated successfully`)
    })
  }

  return (
    <div className="ms" style={{ background: 'white' }}>
      <Tabs defaultActiveKey="config">
        <TabPane tab="Config" key="config">
          <JSONEditor
            value={config}
            onSave={value => handleSaveConfig('config', value)}
            buttonLabel="Save Config"
          />
        </TabPane>
        <TabPane tab="Translations" key="translations">
          <JSONEditor
            value={translations}
            onSave={value => handleSaveConfig('translations', value)}
            buttonLabel="Save Translations"
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

function JSONEditor ({ value, onSave, buttonLabel }) {
  const stringifiedValue = useRef(JSON.stringify(value, null, 2))
  const [shouldRender, setShouldRender] = useState(false)

  useTimeout(() => setShouldRender(true), 100)

  if (!shouldRender) return null
  return (
    <div className={cs(styles.tabContent, 'pb-2')}>
      <ReactCodemirror
        value={stringifiedValue.current}
        mode="json"
        foldGutter
        lineNumbers
        lineWrapping
        search
        lint
        height="calc(100vh - 240px)"
        onChange={(val) => { stringifiedValue.current = val }}
      />
      <Button className="mtm" onClick={() => onSave(stringifiedValue.current)}>{buttonLabel}</Button>
    </div>
  )
}

export default connect(AgileConfigBuilder)
