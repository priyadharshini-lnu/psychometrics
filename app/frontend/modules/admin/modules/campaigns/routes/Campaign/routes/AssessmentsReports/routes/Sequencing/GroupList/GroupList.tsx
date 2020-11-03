import React from 'react'
import { Row, Col, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Group from './Group'
import { PropsFromRedux } from './connect'
import styles from './styles.scss'

const { I18n } = window
interface OwnProps {
  campaignId: number
}
type Props = OwnProps & PropsFromRedux

const GroupList: React.FC<Props> = ({ groups, openModal, campaignId }) => (
  <Row>
    {groups.length
      ? groups.map(group => <Col span={12} key={group.id}><Group group={group} /></Col>)
      : (
        <Col span={24}>
          <div className={styles.noneFound}>
            <div className={styles.noneFoundIcon} />
            <div className={styles.noneFoundTitle}>{I18n.t('assessments_reports.sequencing.no_groups_title')}</div>
            <div className={styles.noneFoundDescription}>
              {I18n.t('assessments_reports.sequencing.no_groups_description')}
            </div>
            <div className={styles.addGroup}>
              <Button type="primary" onClick={() => openModal('GroupFormModal', { campaignId })}>
                <PlusOutlined />
                <span>{I18n.t('assessments_reports.sequencing.add_group')}</span>
              </Button>
            </div>
          </div>
        </Col>
      )}
  </Row>
)

export default GroupList
