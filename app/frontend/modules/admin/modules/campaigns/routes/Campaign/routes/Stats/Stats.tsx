import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Progress, Card, Statistic, Radio, RadioChangeEvent, Typography,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { Select } from 'antd/lib'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  getUsers, getAssessments, fetch, AssesmentStats,
} from '~/modules/admin/modules/campaigns/core/stats'
import styles from './styles.less'
import { COLORS } from './options'
import { Timeseries } from './Timeseries'

const { Column } = Table
const { Title } = Typography
const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const connector = connect((state: RootState) => ({
  users: getUsers(state),
  assessments: getAssessments(state),
}), { fetch })

const StatsComponent: React.FC<Props> = ({
  users, assessments, fetch,
}) => {
  const { campaignId } = useParams() as {campaignId: string}
  const [statsType, setStatsType] = useState('percentage')
  const [status, setStatus] = useState<boolean[]>([true])

  useEffect(() => { fetch(campaignId, status) }, [status])

  const totals = _(assessments).map(a => [
    a.id, a.not_started + a.in_progress + a.completed + a.ineligible + a.interrupted + a.timed_out,
  ]).fromPairs().value()

  const onChangeStatsType = (e: RadioChangeEvent) => setStatsType(e.target.value)
  return (
    <div className={`pt-4 pb-4 ps-4 pe-4 ${styles.container}`}>
      <Row justify="space-between" gutter={[16, 16]}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('administration.stats.top_metrics.users')}
              value={users.total}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('administration.stats.top_metrics.not_started')}
              value={users.not_started || 0}
              valueStyle={{ color: COLORS.not_started }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('administration.stats.top_metrics.in_progress')}
              value={users.in_progress || 0}
              valueStyle={{ color: COLORS.in_progress }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('administration.stats.top_metrics.completed')}
              value={users.completed || 0}
              valueStyle={{ color: COLORS.completed }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('administration.stats.top_metrics.interrupted')}
              value={users.interrupted || 0}
              valueStyle={{ color: COLORS.interrupted }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title={I18n.t('administration.stats.top_metrics.timed_out')}
              value={users.timed_out || 0}
              valueStyle={{ color: COLORS.timed_out }}
            />
          </Card>
        </Col>
        <Col>
          <Select
            mode="multiple"
            placeholder="Select Status"
            value={status}
            onChange={value => setStatus(value.length ? value : [true])}
            options={[
              { value: true, label: 'Active' },
              { value: false, label: 'Inactive' },
            ]}
            className={styles.statusSelect}
          />
        </Col>
        <Timeseries campaignId={campaignId} status={status} />
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <Title level={3}>{I18n.t('administration.stats.assessments.title')}</Title>
            </Col>
            <Col className={styles.statsType}>
              <Radio.Group onChange={onChangeStatsType} defaultValue={statsType} size="small">
                <Radio.Button value="percentage">Percentage</Radio.Button>
                <Radio.Button value="count">Count</Radio.Button>
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
              title={I18n.t('administration.stats.assessments.columns.id')}
              dataIndex="id"
              key="id"
            />
            <Column
              title={I18n.t('administration.stats.assessments.columns.assessment_name')}
              key="name"
              dataIndex="name"
            />
            <Column<AssesmentStats>
              title={I18n.t('administration.stats.assessments.columns.not_started')}
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
              title={I18n.t('administration.stats.assessments.columns.in_progress')}
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
              title={I18n.t('administration.stats.assessments.columns.completed')}
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
              title={I18n.t('administration.stats.assessments.columns.interrupted')}
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
              title={I18n.t('administration.stats.assessments.columns.timed_out')}
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
              title={I18n.t('administration.stats.assessments.columns.ineligible')}
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
