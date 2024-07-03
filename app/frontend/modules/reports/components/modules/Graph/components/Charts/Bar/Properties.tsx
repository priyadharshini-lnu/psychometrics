import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Checkbox, InputNumber, Space, Typography,
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import useUpdate from '~/hooks/useUpdate'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { RootState } from '~/modules/reports/core/rootReducers'
import PropertyPixelOrPercent from '~/modules/reports/components/PropertyPixelOrPercent'
import Series from './Series'
import { GraphPropertyDropdown } from '../CommonPropertyComponents/GraphPropertyDropdown'

const { I18n } = window

const connector = connect(
  (state: RootState, { model }: OwnProps) => ({
    questions: getQuestions(state.report, model.assessment_id),
  }),
  {},
)

interface OwnProps {
  model: PropertiesModel
  questions?: Record<string, unknown>
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

type AxisDisplayOptions = {
  label: string,
  propName: string
}

const graphOptions = [
  I18n.t('reports.builder.graph.properties.graphOption3D'),
  I18n.t('reports.builder.graph.properties.graphOptionStandard'),
]
const positionOptions = [
  I18n.t('reports.builder.graph.properties.positionTopLeft'),
  I18n.t('reports.builder.graph.properties.positionTopMiddle'),
  I18n.t('reports.builder.graph.properties.positionTopRight'),
  I18n.t('reports.builder.graph.properties.positionBottomLeft'),
  I18n.t('reports.builder.graph.properties.positionBottomMiddle'),
  I18n.t('reports.builder.graph.properties.positionBottomRight'),
]
const graphSubtypeOptions = [
  I18n.t('reports.builder.graph.properties.graphTypeVertical'),
  I18n.t('reports.builder.graph.properties.graphTypeHorizontal'),
]
const axisDisplayOptions: AxisDisplayOptions [] = [
  { label: I18n.t('reports.builder.graph.properties.hideXAxisLine'), propName: 'xAxisLinesHide' },
  { label: I18n.t('reports.builder.graph.properties.hideYAxisLine'), propName: 'yAxisLinesHide' },
  { label: I18n.t('reports.builder.graph.properties.hideXAxisTitle'), propName: 'xAxisLabelHide' },
  { label: I18n.t('reports.builder.graph.properties.hideYAxisTitle'), propName: 'yAxisLabelHide' },
]

const Properties: React.FC<Props> = ({ model, questions }: Props) => {
  const forceUpdate = useUpdate()
  const update = () => {
    model.update()
    forceUpdate()
  }

  const changeDataFormat = (value: string) => {
    model.props.dataFormat = value
    update()
  }

  const change3D = (value: string) => {
    model.props.graphicalRepresentation = value
    update()
  }

  const changeBarBorderRadius = (value: string) => {
    model.props.barBorderRadius = value
    update()
  }
  const changeBarBorderRadiusType = (value: boolean) => {
    model.props.barBorderRadiusType = value
    update()
  }

  const changeGraphicalPosition = (value: string) => {
    model.props.graphicalPosition = value
    update()
  }

  const changeLegendPosition = (value: string) => {
    model.props.legendPosition = value
    update()
  }

  const changeMaxValue = (value: string) => {
    model.props.maxValue = value !== '' ? value : null
    update()
  }

  const checkboxHandler = (type: string, e: CheckboxChangeEvent) => {
    model.props[type] = e.target.checked
    update()
  }

  if (!model.props.source || !model.getSourceType()) {
    return null
  }
  let question
  if (model.props.source && model.props.source.type === 'Question') {
    question = questions && questions[model.props.source.id]
    if (!question) {
      return null
    }
  }
  if (!model.getSourceType()) {
    return null
  }
  const seriesFunction = Series[model.getSourceType()].functions
  const funcs = typeof seriesFunction === 'function' ? seriesFunction(question) : seriesFunction

  return (
    <Space direction="vertical">
      <GraphPropertyDropdown
        label={I18n.t('reports.builder.graph.properties.dataFormat')}
        options={funcs}
        changeHandler={changeDataFormat}
        value={model.props.dataFormat}
      />
      <GraphPropertyDropdown
        label={I18n.t('reports.builder.graph.properties.graphSubType')}
        options={graphOptions}
        changeHandler={change3D}
        value={model.props.graphicalRepresentation}
      />
      <GraphPropertyDropdown
        label={I18n.t('reports.builder.graph.properties.graphSubType')}
        options={graphSubtypeOptions}
        changeHandler={changeGraphicalPosition}
        value={model.props.graphicalPosition}
      />
      <MaxValueOptions value={model.props.maxValue || ''} changeHandler={changeMaxValue} />
      <AxisOptions
        model={model}
        options={axisDisplayOptions}
        changeHandler={checkboxHandler}
      />
      <hr className={styles.divider} />
      {model.props.graphicalRepresentation !== '3D' && (
        <>
          <PropertyPixelOrPercent
            label={I18n.t('reports.builder.graph.properties.barBorderRadius')}
            defaultValue={model.props.barBorderRadius}
            size="small"
            step="1"
            onChange={changeBarBorderRadius}
          />
          <Space>
            <Checkbox onChange={e => changeBarBorderRadiusType(e.target.checked)} />
            All corner rounded
          </Space>
        </>
      )}
      <hr className={styles.divider} />
      <GraphPropertyDropdown
        label={I18n.t('reports.builder.graph.properties.legendPosition')}
        options={positionOptions}
        changeHandler={changeLegendPosition}
        value={model.props.legendPosition || 'Bottom Middle'}
      />
      <Checkbox
        checked={model.props.showLegend || false}
        onChange={e => checkboxHandler('showLegend', e)}
        className="font-normal"
      >
        {I18n.t('reports.builder.graph.properties.showLegend')}
      </Checkbox>
      <Checkbox
        checked={model.props.hideEmptyColumns || false}
        onChange={e => checkboxHandler('hideEmptyColumns', e)}
        className="font-normal"
      >
        {I18n.t('reports.builder.graph.properties.hideEmptyColumns')}
      </Checkbox>
      <Checkbox
        checked={model.props.hideZeroValueColumns || false}
        onChange={e => checkboxHandler('hideZeroValueColumns', e)}
        className="font-normal"
      >
        {I18n.t('reports.builder.graph.properties.hideZeroValueColumns')}
      </Checkbox>
    </Space>
  )
}


interface MaxValueOptionsProps {
  value: string | undefined
  changeHandler: (val: string) => void
}

const MaxValueOptions: React.FC<MaxValueOptionsProps> = ({ value, changeHandler }) => (
  <>
    <Typography.Text>{I18n.t('reports.builder.graph.properties.maxValueLabel')}</Typography.Text>
    <InputNumber
      size="small"
      value={value}
      onChange={changeHandler}
      placeholder={I18n.t('reports.builder.graph.properties.maxValueLabelPlaceholder')}
      min="0"
      className="w-100"
    />
  </>
)

interface AxisOptionsProps {
  model: PropertiesModel
  options: AxisDisplayOptions []
  changeHandler: (type: string, e: CheckboxChangeEvent) => void
}

const AxisOptions: React.FC<AxisOptionsProps> = ({ model, options, changeHandler }) => (
  <Space direction="vertical">
    {options.map(displayOption => (
      <Checkbox
        key={displayOption.propName}
        checked={model.props[displayOption.propName] || false}
        onChange={e => changeHandler(displayOption.propName, e)}
        className="font-normal"
      >
        {displayOption.label}
      </Checkbox>
    ))}
  </Space>
)

export const BarProperties = connector(Properties)
