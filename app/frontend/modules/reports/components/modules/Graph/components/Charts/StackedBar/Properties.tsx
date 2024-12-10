import React from 'react'
import { Checkbox, Typography, Space } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import useUpdate from '~/hooks/useUpdate'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/StackedBar'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import { GraphPropertyDropdown } from '../CommonPropertyComponents/GraphPropertyDropdown'

const { I18n } = window

type Props = {
  modules: PropertiesModel[]
}

type AxisDisplayOptions = {
  label: string,
  propName: string
}

const graphSubtypeOptions = [
  I18n.t('reports.builder.graph.properties.graphTypeVertical'),
  I18n.t('reports.builder.graph.properties.graphTypeHorizontal'),
]
const axisDisplayOptions = [
  { label: I18n.t('reports.builder.graph.properties.hideXAxisLine'), propName: 'xAxisLinesHide' },
  { label: I18n.t('reports.builder.graph.properties.hideYAxisLine'), propName: 'yAxisLinesHide' },
]

export const StackedBarProperties: React.FC<Props> = ({ modules }) => {
  const forceUpdate = useUpdate()
  const model = modules[0]
  const { pointWidth } = model.props

  const updateAll = (cb: (item: PropertiesModel) => void) => {
    modules.forEach((module) => {
      cb(module)
      module.update()
    })
    forceUpdate()
  }

  const checkboxHandler = (type: string, e: CheckboxChangeEvent) => {
    updateAll((item: PropertiesModel) => {
      item.props[type] = e.target.checked
    })
  }

  const changePointWidth = (value: string) => {
    updateAll((item: PropertiesModel) => {
      item.props.pointWidth = value
    })
  }

  const changeGraphicalPosition = (value: string) => {
    updateAll((item: PropertiesModel) => {
      item.props.graphicalPosition = value
    })
  }

  return (
    <Space direction="vertical">
      <GraphPropertyDropdown
        options={graphSubtypeOptions}
        label={I18n.t('reports.builder.graph.properties.graphSubType')}
        value={model.props.graphicalPosition}
        changeHandler={changeGraphicalPosition}
      />
      <BarWeight value={pointWidth} changeHandler={changePointWidth} />
      <AxisOptions model={model} changeHandler={checkboxHandler} options={axisDisplayOptions} />
    </Space>
  )
}

interface AxisOptionsProps {
  model: PropertiesModel
  options: AxisDisplayOptions []
  changeHandler: (type: string, e: CheckboxChangeEvent) => void
}

const AxisOptions: React.FC<AxisOptionsProps> = ({ model, changeHandler, options }) => (
  <Space direction="vertical">
    {options.map(displayOption => (
      <Checkbox
        key={displayOption.label}
        checked={model.props[displayOption.propName] || false}
        onChange={e => changeHandler(displayOption.propName, e)}
        className="font-normal"
      >
        {displayOption.label}
      </Checkbox>
    ))}
  </Space>
)

interface BarWeightProps {
  value: string
  changeHandler: (value: string) => void
}

const BarWeight: React.FC<BarWeightProps> = ({ value, changeHandler }) => (
  <>
    <Typography.Text>{I18n.t('reports.builder.graph.properties.barWeight')}</Typography.Text>
    <ChoicesInput value={value} onChange={changeHandler} minValue={10} maxValue={100} />
  </>
)
