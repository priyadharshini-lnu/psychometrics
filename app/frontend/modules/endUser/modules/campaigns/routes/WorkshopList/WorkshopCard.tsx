import {
  Col, Descriptions, Space, Typography,
} from 'antd'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import { ClockCircleOutlined } from '@ant-design/icons'
import { FC } from 'react'
import { formatWorkshopDate } from '~/utils/workshop'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { DetailsCard } from '~/glint'
import styles from './styles.less'

const { Text } = Typography
const { I18n } = window

const STATUSES = {
  upcoming: { label: I18n.t('campaign.workshops.status.upcoming'), textType: 'secondary' },
  ongoing: { label: I18n.t('campaign.workshops.status.ongoing'), textType: 'success' },
}

export const WorkshopCard = ({ workshop }) => {
  const history = useHistory()
  const handleClick = () => {
    history.push(`/assessment_centers/${workshop.id}`)
  }

  return (
    <Col lg={12} xs={24} sm={24} className={styles['workshop-container-card']}>
      <DetailsCard
        title={<TruncatedTitle title={formatWorkshopDate(workshop.startTime)} />}
        status={(
          <StatusText
            startTime={workshop.startTime}
            attendanceStatus={workshop.attendanceStatus}
          />
        )}
        subtitle={(
          <Descriptions size="small">
            <Descriptions.Item label={I18n.t('campaigns.card.duration')}>
              <Space>
                <ClockCircleOutlined />
                <Text>{moment.duration(workshop.duration, 'seconds').humanize()}</Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
        buttonText={I18n.t('campaign.workshops.participate')}
        onButtonClick={handleClick}
      />
    </Col>
  )
}

type StatusTextProps = {
  startTime: string
  attendanceStatus: string
}

const StatusText: FC<StatusTextProps> = ({ startTime, attendanceStatus }) => {
  const status = ():string | null => {
    if (attendanceStatus === 'dropped_out' || attendanceStatus === 'no_show') { return null }
    return moment().isBefore(moment(startTime)) ? 'upcoming' : 'ongoing'
  }
  const statusData = STATUSES[`${status()}`] || {}

  return (
    <Text type={statusData.textType}>{statusData.label}</Text>
  )
}
