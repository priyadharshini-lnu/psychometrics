import React, { useEffect, useRef, useState } from 'react'
import Highcharts, { Chart, Options } from 'highcharts'
import Highcharts3D from 'highcharts/highcharts-3d'
import CustomEvents from 'highcharts-custom-events'
import { connect, ConnectedProps } from 'react-redux'
import type { RangePickerProps } from 'antd/es/date-picker'
import {
  Row, Col, Card, DatePicker,
} from 'antd'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getTimeseries, fetchTimeseries } from '~/modules/admin/modules/campaigns/core/stats'
import { buildHighchartOptions } from './options'
import dayjs from '~/utils/dayjs'

Highcharts3D(Highcharts)
CustomEvents(Highcharts)

const { RangePicker } = DatePicker
const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps { campaignId: string }
type Props = PropsFromRedux & OwnProps

const disabledDate: RangePickerProps['disabledDate'] = current => current && current > dayjs().endOf('day')

const connector = connect((state: RootState) => ({ timeseries: getTimeseries(state) }), { fetchTimeseries })

const DEFAULT_RANGE: [dayjs.Dayjs, dayjs.Dayjs] = [
  dayjs().subtract(1, 'week').startOf('week'),
  dayjs().subtract(1, 'week').endOf('week'),
]

const TimeseriesComponent: React.FC<Props> = ({ timeseries, fetchTimeseries, campaignId }) => {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(DEFAULT_RANGE)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()
  useEffect(() => { fetchTimeseries(campaignId, range) }, [range])

  useEffect(() => { renderChart() }, [timeseries.length])

  const renderChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = undefined
    }
    if (!timeseries.length) return

    const chartOptions: Options = buildHighchartOptions(timeseries)

    containerRef.current ? Highcharts.chart(containerRef.current, chartOptions) : undefined
  }

  useEffect(() => () => { chartRef.current && chartRef.current.destroy() }, [])

  return (
    <>
      <Col span={24}>
        <Row justify="end" gutter={[0, 16]}>
          <Col span={4}>
            <RangePicker
              clearIcon={false}
              disabledDate={disabledDate}
              onChange={(val: [dayjs.Dayjs, dayjs.Dayjs]) => setRange(val)}
              value={range}
              renderExtraFooter={() => (
                <Row justify="space-between">
                  <Col>
                    <a
                      href="#"
                      onClick={() => setRange([
                        dayjs().subtract(1, 'week').startOf('week'),
                        dayjs().subtract(1, 'week').endOf('week'),
                      ])}
                    >
                      {I18n.t('administration.stats.users.date_presets.last_week')}
                    </a>
                  </Col>
                  <Col>
                    <a
                      href="#"
                      onClick={() => setRange([
                        dayjs().subtract(1, 'month').startOf('month'),
                        dayjs().subtract(1, 'month').endOf('month'),
                      ])}
                    >
                      {I18n.t('administration.stats.users.date_presets.last_month')}
                    </a>
                  </Col>
                  <Col>
                    <a href="#" onClick={() => setRange([dayjs().subtract(7, 'd'), dayjs()])}>
                      {I18n.t('administration.stats.users.date_presets.last_7_days')}
                    </a>
                  </Col>
                  <Col>
                    <a href="#" onClick={() => setRange([dayjs().subtract(30, 'd'), dayjs()])}>
                      {I18n.t('administration.stats.users.date_presets.last_30_days')}
                    </a>
                  </Col>
                </Row>
              )}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Card size="small">
          <div ref={containerRef} />
        </Card>
      </Col>
    </>
  )
}

export const Timeseries = connector(TimeseriesComponent)
