import { useEffect } from 'react'
import { Button, Radio, Typography } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import DataSource from '~/modules/reports/components/DataSourceMenu'
import AppStore from '~/modules/reports/store/AppStore'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import ColorSet from '~/modules/reports/components/ColorSet'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import ChartProps from './Charts/Properties'
import iconsStyles from './Graph.less'
import Menu from './ChartsMenu'
import connect from '../connect'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import { GRAPH_CONDITION_TYPES } from '~/modules/reports/consts/Report'
import { isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'
import { STYLE_TYPE } from '~/modules/reports/components/PropertyFonts/components/constants'

const { I18n } = window

const Properties = ({
  reportStlyes, openConditionalText, openGraphValueCondition, modules,
}) => {
  useEffect(() => {
    const appListener = AppStore.addListener('change', () => forceUpdate())

    return () => {
      appListener.remove()
    }
  }, [])

  const model = modules[0]
  if (!model) { return null }

  const isGraphValueConditionSelected = isGraphValueCondition(model.props?.textConditionType)

  const forceUpdate = () => {
    model.update()
  }

  const update = () => {
    model.update()
    forceUpdate()
  }

  const changeTransparentBackground = (e) => {
    modules.forEach((model) => {
      model.props.transparentBackground = e.currentTarget.checked
      model.update()
    })
  }

  const select = (type, presetName) => {
    modules.forEach((model) => {
      model.changeType(type, presetName)
      model.update()
    })
  }

  const checkboxHandler = (type, e) => {
    modules.forEach((model) => {
      model.props[type] = e.currentTarget.checked
      model.update()
    })
  }

  const openConditionModal = () => {
    if (isGraphValueConditionSelected) {
      openGraphValueCondition({ modules })
    } else {
      openConditionalText({ modules })
    }
  }

  const changePrecision = (val) => {
    modules.forEach((model) => {
      model.props.precision = val
      update()
    })
  }

  const handleConditionTypeChange = (e) => {
    const { value } = e.target
    modules.forEach((model) => {
      model.props.textConditionType = value
      model.update()
    })
  }

  const renderCustomProperties = () => {
    if (!modules.length) { return null }
    if (modules.length > 1 && _.uniqBy(modules, 'props.type').length > 1) { return null }

    const { type } = modules[0].props
    if (!type) { return null }

    const View = ChartProps[`${type}Properties`]
    return <View model={model} modules={modules} />
  }

  return (
    <div>
      <div className={styles.title}>Graph Options</div>
      <span className={styles.label}>Graph Type</span>
      <div className={styles.dropdownWrapper}>
        <button
          type="button"
          data-toggle="dropdown"
          className={`btn btn-default dropdown-toggle ${styles.menuButton}`}
        >
          <span className={`${iconsStyles[model.moduleConfig.chartsIcons[model.props.type]]} ${styles.icon}`} />
          <span>{model.moduleConfig.charts[model.props.type] || 'Choose Type'}</span>
          <span className="caret" />
        </button>
        <Menu model={model} onSelect={select} />
      </div>
      <hr className={styles.divider} />
      <div>
        <label style={{ fontWeight: 'normal' }}>
          <input
            type="checkbox"
            checked={model.props.transparentBackground || false}
            onChange={changeTransparentBackground}
            className="me-2"
          />
          <span>Transparent background</span>
        </label>
      </div>
      <DataSource modules={modules} onSelect={update} onlyNumbers />
      <hr className={styles.divider} />
      <Typography.Paragraph level={5}>
        {I18n.t('administration.report_builder.property_panel.text_condition_type')}
      </Typography.Paragraph>
      <Radio.Group
        value={model.props?.textConditionType || GRAPH_CONDITION_TYPES.DEFAULT}
        onChange={handleConditionTypeChange}
      >
        <Radio value={GRAPH_CONDITION_TYPES.DEFAULT}>
          {I18n.t('administration.report_builder.property_panel.graph_condition_types.default')}
        </Radio>
        <Radio value={GRAPH_CONDITION_TYPES.GRAPH_VALUE}>
          {I18n.t('administration.report_builder.property_panel.graph_condition_types.graph_value')}
        </Radio>
      </Radio.Group>
      <Button
        onClick={openConditionModal}
        className="w-100 mt-4"
      >
        {isGraphValueConditionSelected
          ? I18n.t('administration.report_builder.property_panel.manage_graph_value_condition')
          : I18n.t('administration.report_builder.property_panel.manage_styles_condition')}
      </Button>
      {renderCustomProperties()}
      <div className="margin-top-10">
        <PropertyFilter modules={modules} />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block} style={{ position: 'relative' }}>
        <div className="margin-top-10">Number Precision</div>
        <label className={styles.inputLabel}>
          <ChoicesInput
            value={model.props.precision}
            onChange={changePrecision}
            minValue={0}
            maxValue={9}
          />
        </label>
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Legend Font
        <PropertyFonts modules={modules} reportStlyes={reportStlyes} styleType={STYLE_TYPE.legendStyle} />
      </div>
      <hr className={styles.divider} />
      <div className="margin-top-10">Font</div>
      <PropertyFonts modules={modules} reportStlyes={reportStlyes} />
      <div style={{ position: 'relative' }}>
        <div className="margin-top-10">Colors</div>
        <ColorSet model={model} />
      </div>
      <div className="margin-top-10">
        <label style={{ fontWeight: 'normal' }}>
          <input
            type="checkbox"
            checked={model.props.showValues || false}
            onChange={e => checkboxHandler('showValues', e)}
          />
          Show Values
        </label>
      </div>
    </div>
  )
}

Properties.propTypes = {
  reportStlyes: PropTypes.object,
  openConditionalText: PropTypes.func,
}

export default connect(Properties)
