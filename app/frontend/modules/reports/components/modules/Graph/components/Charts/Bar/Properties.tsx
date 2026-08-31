import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Checkbox, InputNumber, Select, Space, Typography,
} from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { RgbaColor } from 'react-colorful'
import { ColorPicker } from '~/glint'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { RootState } from '~/modules/reports/core/rootReducers'
import PropertyPixelOrPercent from '~/modules/reports/components/PropertyPixelOrPercent'
import { isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'
import Series from './Series'
import { isMultiSeriesGraph } from './barGradient'
import { GraphPropertyDropdown } from '../CommonPropertyComponents/GraphPropertyDropdown'

const { I18n } = window

const connector = connect(
  (state: RootState, { modules }: OwnProps) => ({
    questions: getQuestions(state.report, modules[0].assessment_id),
  }),
  {},
)

interface OwnProps {
  modules: PropertiesModel[]
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
const valueLabelPositionOptions = [
  { value: 'left', label: I18n.t('shared.reports_value_label_position_left') },
  { value: 'center', label: I18n.t('shared.reports_value_label_position_center') },
  { value: 'right', label: I18n.t('shared.reports_value_label_position_right') },
]
const gradientDirectionOptions = [
  { value: 'top_to_bottom', label: I18n.t('shared.reports_bar_gradient_direction_top_to_bottom') },
  { value: 'bottom_to_top', label: I18n.t('shared.reports_bar_gradient_direction_bottom_to_top') },
  { value: 'left_to_right', label: I18n.t('shared.reports_bar_gradient_direction_left_to_right') },
  { value: 'right_to_left', label: I18n.t('shared.reports_bar_gradient_direction_right_to_left') },
]
const axisDisplayOptions: AxisDisplayOptions [] = [
  { label: I18n.t('reports.builder.graph.properties.hideXAxisLine'), propName: 'xAxisLinesHide' },
  { label: I18n.t('reports.builder.graph.properties.hideYAxisLine'), propName: 'yAxisLinesHide' },
  { label: I18n.t('reports.builder.graph.properties.hideXAxisTitle'), propName: 'xAxisLabelHide' },
  { label: I18n.t('reports.builder.graph.properties.hideYAxisTitle'), propName: 'yAxisLabelHide' },
  { label: I18n.t('reports.builder.graph.properties.hideEmptyFilters'), propName: 'hideEmptyFilters' },
  { label: I18n.t('reports.builder.graph.properties.reverse'), propName: 'reverse' },
]

const Properties: React.FC<Props> = ({ modules, questions }: Props) => {
  const model = modules[0]
  const usesGraphValueConditions = isGraphValueCondition(model.props.textConditionType)

  const updateAll = (cb?) => {
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  const changeDataFormat = (value: string) => {
    updateAll((model) => {
      model.props.dataFormat = value
    })
  }

  const change3D = (value: string) => {
    updateAll((model) => {
      model.props.graphicalRepresentation = value
    })
  }

  const changeBarBorderRadius = (value: string) => {
    updateAll((model) => {
      model.props.barBorderRadius = value
    })
  }
  const changeBarBorderRadiusType = (value: boolean) => {
    updateAll((model) => {
      model.props.barBorderRadiusType = value
    })
  }

  const changeGraphicalPosition = (value: string) => {
    updateAll((model) => {
      model.props.graphicalPosition = value
    })
  }

  const changeLegendPosition = (value: string) => {
    updateAll((model) => {
      model.props.legendPosition = value
    })
  }

  const changeValueLabelPosition = (value: 'center' | 'left' | 'right' | undefined) => {
    updateAll((model) => {
      model.props.valueLabelPosition = value
    })
  }

  const changeGradientEnabled = (value: boolean) => {
    updateAll((item) => {
      item.props.barGradient.enabled = value
    })
  }

  const changeGradientDirection = (value: NonNullable<PropertiesModel['props']['barGradient']>['direction']) => {
    updateAll((item) => {
      item.props.barGradient.direction = value
    })
  }

  const changeGradientColor = (type: 'startColor' | 'endColor', color: RgbaColor | string) => {
    updateAll((item) => {
      item.props.barGradient[type] = typeof color === 'string' ? color : ''
    })
  }

  const changeMaxValue = (value: string | null) => {
    updateAll((model) => {
      model.props.maxValue = value !== '' ? value : null
    })
  }

  const changeYAxisInterval = (value: string) => {
    updateAll((model) => {
      model.props.yAxisInterval = value !== '' ? value : null
    })
  }

  const changeXAxisInterval = (value: string) => {
    updateAll((model) => {
      model.props.xAxisInterval = value !== '' ? value : null
    })
  }

  const checkboxHandler = (type: string, e: CheckboxChangeEvent) => {
    updateAll((model) => {
      model.props[type] = e.target.checked
    })
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
  const seriesFunction = Series[model.getSourceType()]?.functions
  const funcs = typeof seriesFunction === 'function' ? seriesFunction(question) : seriesFunction

  return (
    <Space orientation="vertical">
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
      <IntervalOptions
        yAxisValue={model.props.yAxisInterval || ''}
        xAxisValue={model.props.xAxisInterval || ''}
        changeYAxisHandler={changeYAxisInterval}
        changeXAxisHandler={changeXAxisInterval}
      />
      <AxisOptions
        model={model}
        options={axisDisplayOptions.filter(
          option => option.propName !== 'reverse'
            || model.props.graphicalPosition === 'Horizontal',
        )}
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
            <Checkbox
              checked={model.props.barBorderRadiusType}
              onChange={e => changeBarBorderRadiusType(e.target.checked)}
            >
              {I18n.t('admin.all_corner_rounded')}
            </Checkbox>
          </Space>
        </>
      )}
      <hr className={styles.divider} />
      {!usesGraphValueConditions && (
        <>
          <BarGradientOptions
            gradient={model.props.barGradient}
            showColorPickers={!isMultiSeriesGraph(model)}
            onEnabledChange={changeGradientEnabled}
            onDirectionChange={changeGradientDirection}
            onColorChange={changeGradientColor}
          />
          <hr className={styles.divider} />
        </>
      )}
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
      <Checkbox
        checked={model.props.showValuesInsideBar || false}
        onChange={e => checkboxHandler('showValuesInsideBar', e)}
        className="font-normal"
      >
        {I18n.t('shared.reports_show_values_inside_bar')}
      </Checkbox>
      <Typography.Text>{I18n.t('shared.reports_value_label_position')}</Typography.Text>
      <Select
        size="small"
        value={model.props.valueLabelPosition}
        onChange={changeValueLabelPosition}
        allowClear
        placeholder={I18n.t('shared.none')}
        getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
        className="w-100"
      >
        {valueLabelPositionOptions.map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
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

interface IntervalOptionsProps {
  yAxisValue: string | undefined
  xAxisValue: string | undefined
  changeYAxisHandler: (val: string) => void
  changeXAxisHandler: (val: string) => void
}

const IntervalOptions: React.FC<IntervalOptionsProps> = ({
  yAxisValue,
  xAxisValue,
  changeYAxisHandler,
  changeXAxisHandler,
}) => (
  <>
    <Typography.Text>{I18n.t('admin.y_axis_interval_label')}</Typography.Text>
    <InputNumber
      size="small"
      value={yAxisValue}
      onChange={changeYAxisHandler}
      placeholder={I18n.t('admin.auto_placeholder')}
      min="1"
      precision={0}
      className="w-100"
    />
    <Typography.Text>{I18n.t('admin.x_axis_interval_label')}</Typography.Text>
    <InputNumber
      size="small"
      value={xAxisValue}
      onChange={changeXAxisHandler}
      placeholder={I18n.t('admin.auto_placeholder')}
      min="1"
      precision={0}
      className="w-100"
    />
  </>
)

interface AxisOptionsProps {
  model: PropertiesModel
  options: AxisDisplayOptions []
  changeHandler: (type: string, e: CheckboxChangeEvent) => void
}

interface BarGradientOptionsProps {
  gradient: NonNullable<PropertiesModel['props']['barGradient']>
  showColorPickers: boolean
  onEnabledChange: (value: boolean) => void
  onDirectionChange: (value: NonNullable<PropertiesModel['props']['barGradient']>['direction']) => void
  onColorChange: (type: 'startColor' | 'endColor', color: RgbaColor | string) => void
}

const BarGradientOptions: React.FC<BarGradientOptionsProps> = ({
  gradient,
  showColorPickers,
  onEnabledChange,
  onDirectionChange,
  onColorChange,
}) => (
  <Space orientation="vertical" className="w-100">
    <Checkbox
      checked={gradient.enabled}
      onChange={e => onEnabledChange(e.target.checked)}
      className="font-normal"
    >
      {I18n.t('shared.reports_bar_gradient_enabled')}
    </Checkbox>
    {gradient.enabled && (
      <>
        {/* Start/end colours only apply to single-value charts. Multi-value charts (360, etc.)
            fade each bar from its own role colour, so showing shared pickers would mislead. */}
        {showColorPickers && (
          <>
            <Typography.Text>{I18n.t('shared.reports_bar_gradient_start_color')}</Typography.Text>
            <ColorPicker
              getValueInHexFormat
              value={gradient.startColor}
              onChange={color => onColorChange('startColor', color)}
            />
            <Typography.Text>{I18n.t('shared.reports_bar_gradient_end_color')}</Typography.Text>
            <ColorPicker
              getValueInHexFormat
              value={gradient.endColor}
              onChange={color => onColorChange('endColor', color)}
            />
          </>
        )}
        <Typography.Text>{I18n.t('shared.reports_bar_gradient_direction')}</Typography.Text>
        <Select
          size="small"
          value={gradient.direction}
          onChange={onDirectionChange}
          getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
          className="w-100"
        >
          {gradientDirectionOptions.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </>
    )}
  </Space>
)

const AxisOptions: React.FC<AxisOptionsProps> = ({ model, options, changeHandler }) => (
  <Space orientation="vertical">
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
