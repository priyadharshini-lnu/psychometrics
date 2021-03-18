import { SeriesBubbleOptions, Options } from 'highcharts-v9'

export interface ChartOptions extends Options {
  series?: SeriesBubbleOptions[]
}

export const defaultChartOptions: ChartOptions = {
  chart: {
    plotBorderWidth: 1,
    backgroundColor: '',
    animation: false,
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
  xAxis: [
    {
      gridLineWidth: 1,
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
  ],
  yAxis: [
    {
      startOnTick: false,
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
  ],
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

interface AdditionalChartOptions {
  backgroundColor: string
  xMean: number
  xMeanTitle: string
  yMean: number
  yMeanTitle: string
  colors: string[]
}

export const additionalChartOptions = ({
  backgroundColor = '#ffffff',
  xMean = 0,
  xMeanTitle = '',
  yMean = 0,
  yMeanTitle = '',
  colors = [],
}: AdditionalChartOptions): ChartOptions => ({
  chart: {
    backgroundColor,
  },
  colors,
  xAxis: [
    {
      plotLines: [
        {
          value: xMean,
          label: {
            text: xMeanTitle,
          },
        },
      ],
    },
  ],
  yAxis: [
    {
      plotLines: [
        {
          value: yMean,
          label: {
            text: yMeanTitle,
          },
        },
      ],
    },
  ],
})
