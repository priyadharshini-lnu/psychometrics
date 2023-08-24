import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'
import _ from 'lodash'
import { Row, Col, PageHeader } from 'antd'
import { ClockCircleOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import { RootState } from '~/modules/endUser/core/rootReducers'
import LangDropdown from '~/components/LangDropdown'
import { DirectionalNavigateBackIcon, ProgressStatus } from '~/glint'
import styles from './styles.less'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    workshop: state.campaigns.workshop,
  }),
)
type PropsFromRedux = ConnectedProps<typeof connector>

const WorkshopPageHeaderComponent: FC<PropsFromRedux> = ({ workshop }) => {
  const counters = _.countBy(workshop?.preworks?.concat(workshop?.activities), 'status')

  const history = useHistory()
  const handleNavigation = () => {
    history.push('/dashboard')
  }

  return (
    <>
      <PageHeader>
        <Col offset={4} span={16} className="ta-c" />
        <Col flex="auto" span={24} className="ta-e">
          <LangDropdown />
        </Col>
      </PageHeader>
      <PageHeader
        className={styles.workshopInformation}
        onBack={handleNavigation}
        backIcon={<DirectionalNavigateBackIcon className={styles.backIcon} />}
        ghost={false}
        title={moment(workshop.startTime).format('Do MMMM YYYY, h:mm a')}
        extra={(
          <Row gutter={[64, 0]}>
            <Col span={8}>
              <ProgressStatus
                theme="light"
                statusText={I18n.t('campaign_assessment.statuses.not_started')}
                StatusIcon={PlayCircleOutlined}
                count={counters.not_started || 0}
              />
            </Col>
            <Col span={8}>
              <ProgressStatus
                theme="light"
                statusText={I18n.t('campaign_assessment.statuses.in_progress')}
                StatusIcon={ClockCircleOutlined}
                count={counters.in_progress || 0}
              />
            </Col>
            <Col span={8}>
              <ProgressStatus
                theme="light"
                statusText={I18n.t('campaign_assessment.statuses.completed')}
                StatusIcon={CheckCircleOutlined}
                count={counters.completed || 0}
              />
            </Col>
          </Row>
        )}
      />
    </>
  )
}

export const WorkshopPageHeader = connector(WorkshopPageHeaderComponent)
