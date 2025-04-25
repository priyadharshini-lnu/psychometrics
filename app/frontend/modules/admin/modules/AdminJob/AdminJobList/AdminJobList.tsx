import React, { useState, useEffect } from 'react'
import {
  List, Badge, Button, Row, Col, Popover,
} from 'antd'
import humps from 'humps'
import { CheckOutlined } from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroller'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import styles from './styles.less'
import { PropsFromRedux } from './connect'
import AdminJob from './AdminJob'

const { App, I18n } = window

const AdminJobList: React.FC<PropsFromRedux> = ({
  adminJobs, fetch, unread, read, readAll, createJob, updateJob, hasMore,
}) => {
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState<boolean>(false) // State to control Popover visibility
  const { features, adminLocales } = window.PsyGlobalState

  useEffect(() => {
    fetch(adminJobs.length)
    if (App.cable) {
      App.cable.subscriptions.create({ channel: 'AdminJobChannel' }, {
        received ({ action, job }) {
          if (action === 'create') createJob(humps.camelizeKeys(job))
          if (action === 'update') updateJob(humps.camelizeKeys(job))
        },
      })
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setVisible(false)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible])

  const handleClick = () => {
    setActive(!active)
  }

  const handleInfiniteOnLoad = () => fetch(adminJobs.length)

  const content = (
    <div className={styles.list}>
      <InfiniteScroll
        initialLoad={false}
        pageStart={0}
        loadMore={handleInfiniteOnLoad}
        hasMore={hasMore}
        useWindow={false}
      >
        <List
          className={styles.listBox}
          itemLayout="vertical"
          dataSource={adminJobs}
          renderItem={job => <AdminJob job={job} read={read} />}
          header={(
            <Row>
              <Col span="12">
                <h3 className="pt8 pl24">{I18n.t('admin_jobs.notifications')}</h3>
              </Col>
              <Col span="12" className="text-align-r">
                <Button
                  type="link"
                  disabled={!unread}
                  icon={<CheckOutlined />}
                  onClick={readAll}
                >
                  <span className={styles.btnText}>{I18n.t('admin_jobs.mark_as_read')}</span>
                </Button>
              </Col>
            </Row>
          )}
        />
      </InfiniteScroll>
    </div>
  )

  return (
    <>
      <div className={styles.container}>
        {
          features.enable_intl_for_admins
        && (
          <div className={styles.langDropdown}>
            <LangDropdownWithChangeLocale locales={adminLocales.split(',')} />
          </div>
        )
        }
        <Popover
          placement="bottomRight"
          content={content}
          trigger="click"
          open={visible}
          onOpenChange={setVisible}
          overlayClassName={styles.overlay}
        >
          <Button aria-label={`${I18n.t('administration.notification_bell_icon')}`} type="text" onClick={handleClick}>
            <Badge count={unread} overflowCount={9}>
              <span className={`fa fa-bell ${styles.bellIcon}`} />
            </Badge>
          </Button>
        </Popover>
      </div>
    </>
  )
}

export default AdminJobList
