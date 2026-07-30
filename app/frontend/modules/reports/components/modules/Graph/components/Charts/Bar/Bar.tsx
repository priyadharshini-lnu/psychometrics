import merge from 'lodash/merge'
import React, { useEffect, useRef } from 'react'
import Highcharts, { Chart, AxisLabelsFormatterContextObject } from 'highcharts'
import Highcharts3D from 'highcharts/highcharts-3d'
import CustomEvents from 'highcharts-custom-events'
import _ from 'lodash'
import cs from 'classnames'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { Factor } from '~/modules/reports/interfaces/Base'
import { SourceModel } from '~/modules/reports/interfaces/graphs/Base'
import Utils from '~/modules/reports/utils/Utils'
import { changeLabel } from '../LabelChanger'
import { getCorrectResults } from '../ResultManager'
import ChartOptions from './ChartOptions'
import Series from './Series'
import styles from './styles.less'

Highcharts3D(Highcharts)
CustomEvents(Highcharts)

const Formats = {
  Count: precision => (_.isNil(precision) ? '{point.y}' : `{point.y:.${precision}f}`),
  Mean: precision => (_.isNil(precision) ? '{point.y:.1f}' : `{point.y:.${precision}f}`),
  Percentile: precision => (_.isNil(precision) ? '{point.y:.1f}%' : `{point.y:.${precision}f}%`),
}

const getDataLabelAlign = (valueLabelPosition: string | undefined, isRTL: boolean) => {
  if (valueLabelPosition === 'center') {
    return 'center'
  }
  if (valueLabelPosition === 'left') {
    return isRTL ? 'right' : 'left'
  }
  if (valueLabelPosition === 'right') {
    return isRTL ? 'left' : 'right'
  }

  return isRTL ? 'right' : 'left'
}

interface Props {
  model: PropertiesModel
  animation?: boolean
  factors: Factor[]
  isRTL: boolean
}

export const Bar: React.FC<Props> = ({
  factors, model, isRTL, animation = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()
  const { fontSize: legendFontSize, fontColor: legendColor, fontFamily: legendFontFamily } = model.props.legendStyle
  const {
    hideEmptyColumns, hideZeroValueColumns, currentJobFactors, targetJobFactors, skillType,
  } = model.props

  const { preventValueOverlap } = model.props

  useEffect(() => {
    renderChart()
  })

  useEffect(
    () => () => {
      chartRef.current && chartRef.current.destroy()
    },
    [],
  )

  const get3DOptions = () => {
    if (model.props.graphicalRepresentation === '3D') {
      return {
        enabled: true,
        alpha: 5,
        beta: 15,
        depth: 50,
        viewDistance: 25,
      }
    }
    return {
      enable: false,
    }
  }

  const changeBarLabel = (collectionName: string, labelObj: AxisLabelsFormatterContextObject) => {
    changeLabel(model, labelObj.value, collectionName)
  }

  const renderChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = undefined
    }
    if (!model.props.source) {
      return null
    }

    if (currentJobFactors || targetJobFactors) {
      factors = factors.filter((factor) => {
        // Case 1: Both current and target job factors are enabled
        if (currentJobFactors && targetJobFactors) {
          const currentJobIncluded = factor?.job_roles?.current_job_role?.included === true
          const targetJobIncluded = factor?.job_roles?.target_job_role?.included === true
          return currentJobIncluded && targetJobIncluded
        }

        // Case 2: Only current job factors are enabled
        if (currentJobFactors) {
          return factor?.job_roles?.current_job_role?.included === true
        }

        // Case 3: Only target job factors are enabled
        if (targetJobFactors) {
          return factor?.job_roles?.target_job_role?.included === true
        }
        return true
      })

      if (skillType && skillType.length !== 0) {
        const sourceFactors = model.getSourceModel()
        if (sourceFactors && Array.isArray(sourceFactors)) {
          const sourceFactorIds = sourceFactors?.map(factor => factor.id)
          factors = factors
            .filter(factor => sourceFactorIds.includes(factor.id))
        }
      }
    }

    const sourceType = model.getSourceType()
    const isCustomFactor = sourceType === 'Factor' && model.props.source.subType === 'custom'
    const sourceModel: SourceModel | Factor[] = currentJobFactors || targetJobFactors ? factors : model.getSourceModel()

    if (sourceType === 'EmbeddedData' && !Array.isArray(sourceModel) && !sourceModel.name) {
      return null
    }
    const data = isCustomFactor ? Series.CustomFactorValueFields : Series[sourceType]
    if (!data) {
      return null
    }
    const series = Utils.checkAndFilterValues(
      { hideEmptyColumns, hideZeroValueColumns },
      data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat, factors),
    )

    let reversedX = false
    let reversedY = false
    let oppositeY = false
    let oppositeX = false
    if (model.props.graphicalPosition === 'Horizontal' && model.props.reverse && !isRTL) {
      reversedX = true
      reversedY = true
      oppositeX = true
      oppositeY = false
    } else if (model.props.graphicalPosition === 'Horizontal' && model.props.reverse && isRTL) {
      reversedX = true
      oppositeY = false
      oppositeX = false
      reversedY = false
    } else if (model.props.graphicalPosition === 'Horizontal' && !model.props.reverse && isRTL) {
      reversedX = true
      reversedY = true
      oppositeX = true
      oppositeY = false
    } else if (model.props.graphicalPosition === 'Horizontal' && !model.props.reverse && !isRTL) {
      reversedX = true
      reversedY = false
      oppositeY = false
      oppositeX = false
    } else if (model.props.graphicalPosition === 'Vertical' && !model.props.reverse && isRTL) {
      reversedX = true
      oppositeY = true
    } else {
      reversedX = false
      reversedY = false
      oppositeY = false
      oppositeX = false
    }

    const format = data.format
      ? data.format(model.props.dataFormat)
      : Formats[model.props.dataFormat](model.props.precision)

    if (!series.length) {
      return null
    }
    let legendVerticalPosition = 'Bottom'
    let legendHorizontalPosition = 'Middle'
    if (model.props.legendPosition) {
      [legendVerticalPosition, legendHorizontalPosition] = model.props.legendPosition.split(' ')
    }
    if (legendHorizontalPosition === 'Middle') {
      legendHorizontalPosition = 'Center'
    }
    const dataLabelAlign = getDataLabelAlign(model.props.valueLabelPosition, isRTL)

    chartRef.current = containerRef.current ? Highcharts.chart(
      containerRef.current,
      merge(
        ChartOptions(model, animation, format, labelObj => changeBarLabel(data.collection, labelObj)),
        {
          chart: {
            type: model.props.graphicalPosition === 'Vertical' ? 'column' : 'bar',
            options3d: get3DOptions(),
            animation,
            rtl: isRTL,
            ...(preventValueOverlap && {
              marginTop: model.props.graphicalPosition === 'Vertical' && 20,
              marginRight: model.props.graphicalPosition === 'Horizontal' && 20,
            }),
          },
          animation,
          legend: {
            enabled: model.props.showLegend,
            align: legendHorizontalPosition.toLowerCase(),
            verticalAlign: legendVerticalPosition.toLowerCase(),
            rtl: isRTL,
            itemStyle: {
              color: legendColor,
              fontSize: legendFontSize || '10px',
              fontFamily: legendFontFamily,
            },
          },
          plotOptions: {
            series: {
              allowPointSelect: false,
              animation,
              borderWidth: 0,
              dataLabels: {
                enabled: !!model.props.showValues,
                format,
                inside: !!model.props.showValuesInsideBar,
                align: dataLabelAlign,
                ...(preventValueOverlap && {
                  overflow: 'allow',
                  crop: false,
                }),
              },
            },
            column: {
              depth: model.props.graphicalRepresentation === '3D' ? 35 : 0,
            },
          },
          xAxis: {
            reversed: reversedX,
            opposite: oppositeX,
          },
          yAxis: {
            reversed: reversedY,
            opposite: oppositeY,
            ...(preventValueOverlap && {
              maxPadding: 0.2,
              endOnTick: false,
              startOnTick: false,
            }),
          },
          series,
        },
      ),
    ) : undefined
    return null
  }

  const rounded = model.props.barBorderRadiusType && model.props.yAxisLinesHide

  return <div ref={containerRef} className={cs(styles.graph, { [styles.rounded]: rounded })} />
}
