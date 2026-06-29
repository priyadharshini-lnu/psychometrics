import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Progress, Card, Statistic, Radio, RadioChangeEvent, Typography, TreeSelect, Space,
  Select,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  getUsers,
  getAssessments,
  getDataSheetFilterOptions,
  fetch,
  fetchTimeseries,
  fetchDataSheetFilterOptions,
  AssesmentStats,
} from '~/modules/admin/modules/campaigns/core/stats'
import styles from './styles.less'
import { COLORS } from './options'
import { Timeseries } from './Timeseries'

const { Column } = Table
const { Title } = Typography
const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux
type DataSheetColumnsState = Record<string, (string | number | null)[]>

const connector = connect((state: RootState) => ({
  users: getUsers(state),
  assessments: getAssessments(state),
  dataSheetFilterOptions: getDataSheetFilterOptions(state),
}), { fetch, fetchTimeseries, fetchDataSheetFilterOptions })

const StatsComponent: React.FC<Props> = ({
  users,
  assessments,
  dataSheetFilterOptions,
  fetch,
  fetchTimeseries,
  fetchDataSheetFilterOptions,
}) => {
  const { campaignId } = useParams() as {campaignId: string}
  const [statsType, setStatsType] = useState('percentage')
  const [status, setStatus] = useState<boolean[]>([true])
  const [selectedDataSheetColumns, setSelectedDataSheetColumns] = useState<DataSheetColumnsState>({})

  const DEFAULT_RANGE: [dayjs.Dayjs, dayjs.Dayjs] = [
    dayjs().subtract(1, 'week').startOf('week'),
    dayjs().subtract(1, 'week').endOf('week'),
  ]
  const [range] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(DEFAULT_RANGE)

  const dataSheetColumnsTreeData = React.useMemo(() => {
    const options = dataSheetFilterOptions?.options || dataSheetFilterOptions

    if (!options || typeof options !== 'object') {
      return []
    }

    return Object.keys(options).map((key) => {
      const values = options[key]

      if (!Array.isArray(values)) {
        return {
          title: key,
          value: `category_${key.toLowerCase()}`,
          children: [],
        }
      }

      return {
        title: key,
        value: `category_${key.toLowerCase()}`,
        children: values
          .filter(value => value !== undefined)
          .map(value => ({
            title: value === null ? 'empty' : String(value),
            value: value === null
              ? `${key.toLowerCase()}_null`
              : `${key.toLowerCase()}_${String(value).toLowerCase().replace(/\s+/g, '_')}`,
          })),
      }
    })
  }, [dataSheetFilterOptions])

  const getFilteredDataSheetColumns = (): Record<string, (string | number | null)[]> => Object.fromEntries(
    Object.entries(selectedDataSheetColumns).filter(([, values]) => values.length > 0),
  )

  const addValueToCategory = (
    result: Record<string, (string | number | null)[]>,
    categoryKey: string,
    value: string | number | null,
  ) => {
    if (!result[categoryKey]) {
      result[categoryKey] = []
    }
    if (!result[categoryKey].includes(value)) {
      result[categoryKey].push(value)
    }
  }

  useEffect(() => {
    fetchDataSheetFilterOptions(campaignId)
  }, [campaignId])

  useEffect(() => {
    const filteredColumns = getFilteredDataSheetColumns()
    fetch(campaignId, status, filteredColumns)
    fetchTimeseries(campaignId, range, status, filteredColumns)
  }, [status, selectedDataSheetColumns, dataSheetFilterOptions])

  const onChangeStatsType = (e: RadioChangeEvent) => setStatsType(e.target.value)

  const totals = _(assessments).map(a => [
    a.id, a.not_started + a.in_progress + a.completed + a.ineligible + a.interrupted + a.timed_out,
  ]).fromPairs().value()

  return (
    <div className={`pt-4 pb-4 ps-4 pe-4 ${styles.container}`}>
      <Row justify="space-between" gutter={[16, 16]}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('admin.stats_top_metrics_users')}
              value={users.total}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('admin.stats_top_metrics_not_started')}
              value={users.not_started || 0}
              styles={{ content: { color: COLORS.not_started } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('admin.stats_top_metrics_in_progress')}
              value={users.in_progress || 0}
              styles={{ content: { color: COLORS.in_progress } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('admin.stats_top_metrics_completed')}
              value={users.completed || 0}
              styles={{ content: { color: COLORS.completed } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('admin.stats_top_metrics_interrupted')}
              value={users.interrupted || 0}
              styles={{ content: { color: COLORS.interrupted } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('admin.stats_top_metrics_timed_out')}
              value={users.timed_out || 0}
              styles={{ content: { color: COLORS.timed_out } }}
            />
          </Card>
        </Col>
        <Col>
          <Space>
            <Select
              mode="multiple"
              placeholder="Select Status"
              value={status}
              onChange={value => setStatus(value.length ? value : [true])}
              options={[
                { value: true, label: I18n.t('admin.stats_assessments_active') },
                { value: false, label: I18n.t('admin.stats_assessments_inactive') },
              ]}
              className={styles.statusSelect}
            />

            {Object.keys(dataSheetFilterOptions?.options || dataSheetFilterOptions || {}).length > 0 && (
              <TreeSelect
                className="w-100"
                style={{ minWidth: 250 }}
                multiple
                maxTagCount={2}
                treeCheckable
                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                treeData={dataSheetColumnsTreeData}
                placeholder="Select Available Data Sheet Columns"
                popupMatchSelectWidth={false}
                value={Object.entries(selectedDataSheetColumns).flatMap(([originalKey, values]) => {
                  const lowerKey = originalKey.toLowerCase()
                  return values.map(val => (val === null
                    ? `${lowerKey}_null`
                    : `${lowerKey}_${String(val).toLowerCase().replace(/\s+/g, '_')}`
                  ))
                })}
                onChange={(selected: string[]) => {
                  const result: Record<string, (string | number | null)[]> = {}
                  const options = dataSheetFilterOptions?.options || dataSheetFilterOptions

                  selected.forEach((selectedValue) => {
                    if (selectedValue.startsWith('category_')) {
                      const categoryKey = selectedValue.replace('category_', '')
                      const originalKey = Object.keys(options || {}).find(k => k.toLowerCase() === categoryKey)

                      if (originalKey) {
                        const categoryValues = options[originalKey] || []
                        categoryValues.forEach(value => addValueToCategory(result, originalKey, value))
                      }
                    } else {
                      const parts = selectedValue.split('_')
                      if (parts.length >= 2) {
                        const categoryKey = parts[0]
                        const valueKey = parts.slice(1).join('_')
                        const originalKey = Object.keys(options || {}).find(k => k.toLowerCase() === categoryKey)

                        if (originalKey) {
                          if (valueKey === 'null') {
                            addValueToCategory(result, originalKey, null)
                          } else {
                            const categoryValues = options[originalKey] || []
                            const matchingValue = categoryValues.find(val => val !== null
                              && String(val).toLowerCase().replace(/\s+/g, '_') === valueKey)

                            if (matchingValue !== undefined) {
                              addValueToCategory(result, originalKey, matchingValue)
                            }
                          }
                        }
                      }
                    }
                  })

                  setSelectedDataSheetColumns(result)
                }}
                treeDefaultExpandAll
              />
            )}
          </Space>
        </Col>
        <Timeseries
          campaignId={campaignId}
          status={status}
          selectedDataSheetColumns={getFilteredDataSheetColumns()}
        />
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <Title level={3}>{I18n.t('admin.stats_assessments_title')}</Title>
            </Col>
            <Col className={styles.statsType}>
              <Radio.Group onChange={onChangeStatsType} defaultValue={statsType} size="small">
                <Radio.Button value="percentage">{I18n.t('admin.stats_assessments_percentage')}</Radio.Button>
                <Radio.Button value="count">{I18n.t('admin.stats_assessments_count')}</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={assessments}
            pagination={false}
          >
            <Column
              title={I18n.t('shared.id')}
              dataIndex="id"
              key="id"
            />
            <Column
              title={I18n.t('admin.stats_assessments_columns_assessment_name')}
              key="name"
              dataIndex="name"
            />
            <Column<AssesmentStats>
              title={I18n.t('admin.stats_assessments_columns_not_started')}
              key="not_started"
              dataIndex="not_started"
              render={
                (value, a) => (
                  <CustomProgress
                    value={value}
                    type="not_started"
                    max={totals[a.id]}
                    statsType={statsType}
                  />
                )
              }
            />
            <Column<AssesmentStats>
              title={I18n.t('admin.stats_assessments_columns_in_progress')}
              key="in_progress"
              dataIndex="in_progress"
              render={
                (value, a) => (
                  <CustomProgress
                    value={value}
                    type="in_progress"
                    max={totals[a.id]}
                    statsType={statsType}
                  />
                )
              }
            />
            <Column<AssesmentStats>
              title={I18n.t('admin.stats_assessments_columns_completed')}
              key="completed"
              dataIndex="completed"
              render={
                (value, a) => (
                  <CustomProgress
                    value={value}
                    type="completed"
                    max={totals[a.id]}
                    statsType={statsType}
                  />
                )
              }
            />
            <Column<AssesmentStats>
              title={I18n.t('admin.stats_assessments_columns_interrupted')}
              key="interrupted"
              dataIndex="interrupted"
              render={
                (value, a) => (
                  <CustomProgress
                    value={value}
                    type="interrupted"
                    max={totals[a.id]}
                    statsType={statsType}
                  />
                )
              }
            />
            <Column<AssesmentStats>
              title={I18n.t('admin.stats_assessments_columns_timed_out')}
              key="timed_out"
              dataIndex="timed_out"
              render={
                (value, a) => (
                  <CustomProgress
                    value={value}
                    type="timed_out"
                    max={totals[a.id]}
                    statsType={statsType}
                  />
                )
              }
            />
            <Column<AssesmentStats>
              title={I18n.t('admin.stats_assessments_columns_ineligible')}
              key="ineligible"
              dataIndex="ineligible"
              render={
                (value, a) => (
                  <CustomProgress
                    value={value}
                    type="ineligible"
                    max={totals[a.id]}
                    statsType={statsType}
                  />
                )
              }
            />
          </Table>
        </Col>
      </Row>
    </div>
  )
}

const CustomProgress: React.FC<{ value: number, max: number, type: string, statsType: string }> = ({
  value, type, max, statsType,
}) => (
  value > 0 ? (
    <Progress
      format={
          percent => (
            statsType === 'percentage'
              ? `${Math.round(percent || 0)}%`
              : value.toLocaleString()
          )}
      percent={(value * 100) / max}
      strokeLinecap="square"
      strokeColor={COLORS[type]}
    />
  ) : <span>-</span>
)

export const Stats = connector(StatsComponent)
