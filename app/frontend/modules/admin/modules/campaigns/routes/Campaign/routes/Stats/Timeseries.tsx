import React, { useEffect, useRef, useState } from 'react'
import Highcharts, { Chart, Options } from 'highcharts'
import Highcharts3D from 'highcharts/highcharts-3d'
import CustomEvents from 'highcharts-custom-events'
import { connect, ConnectedProps } from 'react-redux'
import type { RangePickerProps } from 'antd/es/date-picker'
import {
  Row, Col, Card, DatePicker,
} from 'antd'
import { getTimezone } from '~/core/config'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getTimeseries, fetchTimeseries } from '~/modules/admin/modules/campaigns/core/stats'
import { buildHighchartOptions } from './options'
import dayjs from '~/utils/dayjs'

Highcharts3D(Highcharts)
CustomEvents(Highcharts)

const { RangePicker } = DatePicker
const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  campaignId: string,
  status: boolean[],
  selectedDataSheetColumns: Record<string, (string | number | null)[]>
}
type Props = PropsFromRedux & OwnProps

const connector = connect((state: RootState) => ({
  timeseries: getTimeseries(state),
  timezone: getTimezone(state),
}), { fetchTimeseries })


const DEFAULT_RANGE: [dayjs.Dayjs, dayjs.Dayjs] = [
  dayjs().subtract(1, 'week').startOf('week'),
  dayjs().subtract(1, 'week').endOf('week'),
]

const TimeseriesComponent: React.FC<Props> = ({
  timeseries, status, fetchTimeseries, campaignId, timezone, selectedDataSheetColumns,
}) => {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(DEFAULT_RANGE)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()
  useEffect(() => {
    if (range[0] && range[1]) {
      fetchTimeseries(campaignId, range as [dayjs.Dayjs, dayjs.Dayjs], status, selectedDataSheetColumns)
    }
  }, [range, timezone, status, selectedDataSheetColumns])
  useEffect(() => {
    const start = dayjs().tz(timezone).subtract(1, 'week').startOf('week') as unknown as dayjs.Dayjs
    const end = dayjs().tz(timezone).subtract(1, 'week').endOf('week') as unknown as dayjs.Dayjs
    setRange([start, end])
  }, [timezone])

  useEffect(() => { renderChart() }, [timeseries.length])

  const renderChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = undefined
    }
    if (!timeseries.length) return
    if (!range[0] || !range[1]) return

    const chartOptions: Options = buildHighchartOptions(timeseries, range[0], range[1])

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    containerRef.current ? Highcharts.chart(containerRef.current, chartOptions) : undefined
  }

  useEffect(() => () => { chartRef.current && chartRef.current.destroy() }, [])

  const updateRange = (range: [dayjs.Dayjs, dayjs.Dayjs]): void => {
    if (range[0] !== range[1]) {
      setRange(range)
    }

    setRange([range[0].startOf('day'), range[1].endOf('day')])
  }

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const endOfDay = dayjs().tz(timezone).endOf('day') as unknown as dayjs.Dayjs
    return current && current > endOfDay
  }

  return (
    <>
      <Col span={24}>
        <Row justify="end" gutter={[0, 16]}>
          <Col>
            <RangePicker
              clearIcon={false}
              disabledDate={disabledDate}
              onChange={(val: [dayjs.Dayjs, dayjs.Dayjs]) => updateRange(val)}
              value={range}
              ranges={
                {
                  [I18n.t('admin.stats_users_date_presets_today')]: [
                    dayjs().tz(timezone).startOf('day') as unknown as dayjs.Dayjs,
                    dayjs().tz(timezone).endOf('day') as unknown as dayjs.Dayjs,
                  ],
                  [I18n.t('admin.stats_users_date_presets_yesterday')]: [
                    dayjs().tz(timezone).subtract(1, 'day').startOf('day') as unknown as dayjs.Dayjs,
                    dayjs().tz(timezone).subtract(1, 'day').endOf('day') as unknown as dayjs.Dayjs,
                  ],
                  [I18n.t('admin.stats_users_date_presets_last_week')]: [
                    dayjs().tz(timezone).subtract(1, 'week').startOf('week') as unknown as dayjs.Dayjs,
                    dayjs().tz(timezone).subtract(1, 'week').endOf('week') as unknown as dayjs.Dayjs,
                  ],
                  [I18n.t('admin.stats_users_date_presets_last_month')]: [
                    dayjs().tz(timezone).subtract(1, 'month').startOf('month') as unknown as dayjs.Dayjs,
                    dayjs().tz(timezone).subtract(1, 'month').endOf('month') as unknown as dayjs.Dayjs,
                  ],
                  [I18n.t('admin.stats_users_date_presets_last_7_days')]: [
                    dayjs().tz(timezone).subtract(7, 'd') as unknown as dayjs.Dayjs,
                    dayjs().tz(timezone) as unknown as dayjs.Dayjs,
                  ],
                  [I18n.t('admin.stats_users_date_presets_last_30_days')]: [
                    dayjs().tz(timezone).subtract(30, 'd') as unknown as dayjs.Dayjs,
                    dayjs().tz(timezone) as unknown as dayjs.Dayjs,
                  ],
                }
              }
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
