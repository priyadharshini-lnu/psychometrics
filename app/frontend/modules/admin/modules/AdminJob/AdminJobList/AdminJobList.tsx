import React, { useState, useEffect } from 'react'
import {
  List, Badge, Button, Row, Col,
} from 'antd'
import humps from 'humps'
import {
  CheckOutlined,
} from '@ant-design/icons'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'
import AdminJob from './AdminJob'

const { App, I18n } = window

const AdminJobList: React.FC<PropsFromRedux> = ({
  adminJobs, fetch, unread, readAll, createJob, updateJob,
}) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    fetch()
    if (App.cable) {
      App.cable.subscriptions.create({ channel: 'AdminJobChannel' }, {
        received ({ action, job }) {
          if (action === 'create') createJob(humps.camelizeKeys(job))
          if (action === 'update') updateJob(humps.camelizeKeys(job))
        },
      })
    }
  }, [])

  const handleClick = () => {
    setActive(!active)
  }

  return (
    <div className={styles.container}>
      <Badge count={unread} overflowCount={9} offset={[-10, 17]}>
        <span onClick={handleClick} className={`fa fa-bell ${styles.bellIcon}`} />
      </Badge>
      {active && (
      <List
        itemLayout="vertical"
        dataSource={adminJobs}
        className={styles.list}
        renderItem={job => <AdminJob job={job} />}
        header={(
          <Row>
            <Col span="12">
              <h3 className="pt8">{I18n.t('admin_jobs.notifications')}</h3>
            </Col>
            <Col span="12" className="text-align-r">
              <Button
                type="link"
                disabled={!unread}
                icon={<CheckOutlined />}
                onClick={readAll}
              >
                {I18n.t('admin_jobs.mark_as_read')}
              </Button>
            </Col>
          </Row>
        )}
        bordered
      />
      )}
    </div>
  )
}

export default AdminJobList
