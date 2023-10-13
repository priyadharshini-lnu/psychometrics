import { FC } from 'react'

import Module from '~/modules/reports/core/interfaces/Module'

import ColorSet from '~/modules/reports/components/ColorSet'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import { ColorPicker } from '~/glint'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import { rgba2hex } from '~/utils/color'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import QuestionList from './dataSources/QuestionList'
import FactorList from './dataSources/FactorList'
import MilestoneList from './MilestoneList'

interface Props {
  model: Module
}

const Properties: FC<Props> = ({ model }) => {
  const {
    props: { sourceType },
  } = model

  const onChange = (key: string, value: unknown) => {
    model.props[key] = value
    model.update()
  }

  return (
    <div>
      <div>Font</div>
      <PropertyFonts model={model} colors={false} />
      <div className="mt-2">Competencies</div>
      <SourceTypeButtonGroup model={model} onChange={onChange} />
      {sourceType === 'Factor' && (
        <FactorList model={model} onChange={onChange} />
      )}
      {sourceType === 'Question' && (
        <QuestionList model={model} onChange={onChange} />
      )}
      <div className="mtm">
        <PropertyFilter model={model} />
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
      <div className="margin-top-10">
        Show
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
    </div>
  )
}

export default Properties
