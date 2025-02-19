import { FC } from 'react'

import { Checkbox, InputNumber } from 'antd'
import Module from '~/modules/reports/core/interfaces/Module'

import ColorSet from '~/modules/reports/components/ColorSet'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import { ColorPicker } from '~/glint'
import { rgba2hex } from '~/utils/color'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import QuestionList from './dataSources/QuestionList'
import FactorList from './dataSources/FactorList'
import MilestoneList from './MilestoneList'
import PaginationOptions from '~/modules/reports/components/PaginationOptions'

interface Props {
  modules: Module[]
}

const Properties: FC<Props> = ({ modules }) => {
  const model = modules[0]

  const {
    props: { sourceType },
  } = model

  const onChange = (key: string, value: unknown) => {
    modules.forEach((module) => {
      module.props[key] = value
      module.update()
    })
  }

  return (
    <div>
      <div className="mt-2">Competencies</div>
      <SourceTypeButtonGroup model={model} onChange={onChange} />
      {sourceType === 'Factor' && (
        <FactorList model={model} onChange={onChange} />
      )}
      {sourceType === 'Question' && (
        <QuestionList model={model} onChange={onChange} />
      )}
      <div className="mtm">
        <PropertyFilter modules={modules} />
      </div>
      <div className={styles.block}>
        Header Colours
        <div className={styles.flexRow}>
          <ColorPicker
            defaultColor="#00000000"
            value={typeof model.props.mainHeaderColor === 'string'
              ? model.props.mainHeaderColor : rgba2hex(model.props.mainHeaderColor)}
            getValueInHexFormat
            onChange={color => onChange('mainHeaderColor', color)}
          />
          <ColorPicker
            defaultColor="#00000000"
            value={typeof model.props.secondHeaderColor === 'string'
              ? model.props.secondHeaderColor : rgba2hex(model.props.secondHeaderColor)}
            getValueInHexFormat
            onChange={color => onChange('secondHeaderColor', color)}
          />
        </div>
      </div>
      <div className={styles.block}>
        Score Background Color
        <ColorPicker
          defaultColor="#00000000"
          getValueInHexFormat
          value={typeof model.props.scoreBackgroundColor === 'string'
            ? model.props.scoreBackgroundColor : rgba2hex(model.props.scoreBackgroundColor || {})}
          onChange={color => onChange('scoreBackgroundColor', color)}
        />
      </div>
      <div className={styles.block}>
        Border Color
        <ColorPicker
          defaultColor="#00000000"
          getValueInHexFormat
          value={model.props.borderColor}
          onChange={color => onChange('borderColor', color)}
        />
      </div>
      <div className="margin-top-10">
        <div>Number Precision:</div>
        <InputNumber min={0} size="small" value={model.props.precision} onChange={val => onChange('precision', val)} />
      </div>
      <div className="margin-top-10">
        <div className={styles.flexRow}>
          <Checkbox
            className="font-normal"
            style={{ marginRight: '5px' }}
            checked={model.props.hideHeader}
            onChange={e => onChange('hideHeader', e.target.checked)}
          >
            Hide Header
          </Checkbox>
        </div>
        <div className={styles.flexRow}>
          <Checkbox
            className="font-normal"
            style={{ marginRight: '5px', marginBlock: '3px 5px' }}
            checked={model.props.hideLegend}
            onChange={e => onChange('hideLegend', e.target.checked)}
          >
            Hide Legend
          </Checkbox>
        </div>
        Show
        <div className={styles.flexRow}>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.showAsBarChart}
              onChange={e => onChange('showAsBarChart', e.currentTarget.checked)}
            />
            As Bar Chart
          </label>
        </div>
        <div className={styles.flexRow}>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.showLabels}
              onChange={e => onChange('showLabels', e.currentTarget.checked)}
            />
            Labels
          </label>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.showValues}
              onChange={e => onChange('showValues', e.currentTarget.checked)}
            />
            Values
          </label>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.showLines}
              disabled={model.props.showAsBarChart}
              onChange={e => onChange('showLines', e.currentTarget.checked)}
            />
            Lines
          </label>
        </div>
      </div>
      <div className="mtm">
        <ColorSet model={model} />
      </div>
      <MilestoneList model={model} />
      <div className={styles.divider} />

      {modules.length > 1 ? null
        : (
          <div className="mtm">
            <PaginationOptions module={model} onChange={onChange} />
          </div>
        )}
    </div>
  )
}

export default Properties
