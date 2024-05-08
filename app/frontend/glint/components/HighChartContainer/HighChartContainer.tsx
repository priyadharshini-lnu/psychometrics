import { useRef, useEffect, FC } from 'react'
import Highcharts from 'highcharts'

type Props = {
  chartOptions: Highcharts.Options
  containerClassName?: string
  onChartLoad?: (chart: Highcharts.Chart) => void
}

export const HighChartContainer:FC<Props> = ({
  chartOptions, containerClassName, onChartLoad,
}) => {
  const chartRef = useRef(null)
  useEffect(() => {
    if (!chartRef.current) return
    const chart = new Highcharts.Chart(chartRef.current, {
      ...chartOptions,
    })
    onChartLoad && onChartLoad(chart)

    return () => {
      chart.destroy()
    }
  }, [chartOptions])

  return (
    <div className={containerClassName} ref={chartRef} />
  )
}
