
import { useState, useRef } from 'react'
import {
  Tabs, Button, message,
} from 'antd'
import _ from 'lodash'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import cs from 'classnames'
import Ajv from 'ajv'
import schema from '@thetalententerprise/interactive-assessments/dist/schema.json'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/jump-to-line'


import '~/styles/utils.less'

import { useTimeout } from '~/hooks/useTimeout'
import connect from './connect'
import styles from './styles.less'

const { TabPane } = Tabs

const AgileConfigBuilder = ({
  assessmentId, config, translations, saveConfig,
}) => {
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
      // eslint-disable-next-line no-console
      console.error(validate.errors)
      return
    }
    saveConfig(assessmentId, { [key]: parseJson }).then(() => {
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
      <CodeMirror
        value={stringifiedValue.current}
        options={{
          mode: {
            name: 'javascript',
            json: true,
          },
          foldGutter: true,
          lineNumbers: true,
          lineWrapping: true,
          extraKeys: {
            'Ctrl-Q': cm => cm.foldCode(cm.getCursor()),
            'Alt-F': 'findPersistent',
          },
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        }}
        editorDidMount={(editor) => {
          editor.setSize('100%', 'calc(100vh - 240px)')
        }}
        onChange={(editor, data, value) => { stringifiedValue.current = value }}
      />
      <Button className="mtm" onClick={() => onSave(stringifiedValue.current)}>{buttonLabel}</Button>
    </div>
  )
}

export default connect(AgileConfigBuilder)
