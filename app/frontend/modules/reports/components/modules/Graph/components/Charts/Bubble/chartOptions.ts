import { SeriesBubbleOptions, Options } from 'highcharts'
import { AdditionalChartOptions } from '~/modules/reports/interfaces/graphs/Bubble'

export interface ChartOptions extends Options {
  series?: SeriesBubbleOptions[]
}

export const defaultChartOptions: ChartOptions = {
  chart: {
    plotBorderWidth: 0,
    backgroundColor: '',
    animation: false,
  },
  accessibility: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
  credits: {
    enabled: false,
  },
  title: {
    text: '',
  },
  subtitle: {
    text: '',
  },
  xAxis: {
    gridLineWidth: 0,
    title: {
      text: '',
    },
    labels: {
      format: '{value}',
    },
    zoomEnabled: false,
    plotLines: [
      {
        color: 'black',
        dashStyle: 'Dot',
        width: 2,
        value: 0,
        label: {
          rotation: 0,
          y: 15,
          style: {
            fontStyle: 'italic',
          },
          text: '',
        },
        zIndex: 3,
      },
    ],
  },
  yAxis: {
    startOnTick: false,
    lineWidth: 1,
    tickWidth: 1,
    gridLineWidth: 0,
    endOnTick: false,
    title: {
      text: '',
    },
    labels: {
      format: '{value}',
    },
    zoomEnabled: false,
    maxPadding: 0.2,
    plotLines: [
      {
        color: 'black',
        dashStyle: 'Dot',
        width: 2,
        value: 0,
        label: {
          align: 'right',
          style: {
            fontStyle: 'italic',
          },
          text: '',
          x: -10,
        },
        zIndex: 3,
      },
    ],
  },
  plotOptions: {
    series: {
      dataLabels: {
        enabled: true,
        format: '{point.label}',
        align: 'center',
        inside: false,
        animation: false,
      },
    },
  },
}

export const additionalChartOptions = ({
  backgroundColor = '#ffffff',
  xMean = 0,
  xMeanTitle = '',
  yMean = 0,
  yMeanTitle = '',
  xMin = 0,
  xMax = 100,
  yMin = 0,
  yMax = 100,
  colors = [],
  size,
  bubbleSize,
  yAxisLabelDisabled,
  yAxisTitleDisabled,
  yAxisLinesHide,
}: AdditionalChartOptions): ChartOptions => ({
  chart: {
    backgroundColor,
  },
  colors,
  xAxis: {
    title: {
      text: xMeanTitle,
      align: 'high',
      y: -50,
    },
    min: xMin,
    max: xMax,
    offset: yMean && (yMax - yMin > 0) ? -yMean * size.height / (yMax - yMin) : 0,
  },
  yAxis: {
    title: {
      text: yAxisTitleDisabled ? '' : yMeanTitle,
      align: 'low',
      rotation: 0,
      y: 20,
    },
    gridLineWidth: yAxisLinesHide ? 0 : 1,
    labels: {
      enabled: !yAxisLabelDisabled,
    },
    min: yMin,
    max: yMax,
    offset: xMean && (xMax - xMin > 0) ? -xMean * size.width / (xMax - xMin) : 0,
  },
  plotOptions: {
    bubble: {
      ...(bubbleSize ? {
        sizeBy: 'width',
        minSize: bubbleSize,
        maxSize: bubbleSize,
        dataLabels: {
          y: bubbleSize + 10,
          allowOverlap: true,
        },
      } : {}),
    },
  },
})
