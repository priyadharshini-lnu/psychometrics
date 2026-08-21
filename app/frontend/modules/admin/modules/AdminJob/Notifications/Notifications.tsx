import React, { useState, useEffect } from 'react'
import {
  Badge, Button, Divider, Drawer, Empty, Flex, List, Popover, SchemeScope, Typography, useGlintToken,
} from '@thetalententerprise/glint'
import {
  Check,
  Notifications as NotificationsIcon,
} from '@thetalententerprise/glint/icons'
import humps from 'humps'
import InfiniteScroll from 'react-infinite-scroller'
import styles from './styles.less'
import { PropsFromRedux } from './connect'
import AdminJob from './AdminJob'
import consumer from '~/core/consumer'

const { I18n } = window

type Props = PropsFromRedux & {
  isMobile: boolean
}

const Notifications: React.FC<Props> = ({
  adminJobs,
  fetch,
  unread,
  read,
  readAll,
  createJob,
  updateJob,
  hasMore,
  isMobile,
}) => {
  const [visible, setVisible] = useState<boolean>(false)
  const token = useGlintToken()

  useEffect(() => {
    fetch(adminJobs.length)
    if (consumer()) {
      consumer().subscriptions.create({ channel: 'AdminJobChannel' }, {
        received ({ action, job }) {
          if (action === 'create') createJob(humps.camelizeKeys(job))
          if (action === 'update') updateJob(humps.camelizeKeys(job))
        },
      })
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible])

  const emptyText = <Empty description={I18n.t('admin.no_notifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} />

  // The divider belongs to the header, not the scrollport, or it would scroll away with the first row.
  const panelHeader = (
    <>
      <Flex
        align="center"
        justify="space-between"
        gap={token.marginXS}
        style={{ paddingInline: token.padding, paddingBlock: token.paddingXS }}
      >
        <Typography.Title level={5}>{I18n.t('admin.notifications')}</Typography.Title>
        <Button
          type="link"
          disabled={!unread}
          icon={<Check />}
          onClick={readAll}
        >
          {I18n.t('admin_jobs.mark_as_read')}
        </Button>
      </Flex>
      <Divider style={{ margin: 0 }} />
    </>
  )

  // The scrollport, so the header above stays put and the scrollbar hugs the panel edge rather than the popover's.
  const listRegion = (
    <Flex vertical flex={1} className={styles.scroller} style={{ paddingInline: token.padding }}>
      <InfiniteScroll
        initialLoad={false}
        pageStart={0}
        loadMore={() => fetch(adminJobs.length)}
        hasMore={hasMore}
        useWindow={false}
      >
        <List
          locale={{ emptyText }}
          itemLayout="vertical"
          dataSource={adminJobs}
          renderItem={job => <AdminJob job={job} read={read} />}
        />
      </InfiniteScroll>
    </Flex>
  )

  const bell = (
    <Button
      aria-label={I18n.t('admin.notification_bell_icon_alt_text')}
      type="text"
      onClick={isMobile ? () => setVisible(true) : undefined}
      icon={(
        <Badge count={unread} overflowCount={9} size="small">
          <NotificationsIcon fill={unread > 0} />
        </Badge>
      )}
    />
  )

  // Opened from the top bar, so without this the bar's small size crosses the portal into the panel.
  const content = (
    <SchemeScope size="medium">
      <Flex vertical className={styles.panel}>
        {panelHeader}
        {listRegion}
      </Flex>
    </SchemeScope>
  )

  if (isMobile) {
    return (
      <>
        {bell}
        <Drawer
          open={visible}
          onClose={() => setVisible(false)}
          placement="bottom"
          size="100%"
          closable
          styles={{ body: { padding: 0 } }}
        >
          <SchemeScope size="medium">
            <Flex vertical className={styles.drawerPanel}>
              {panelHeader}
              {listRegion}
            </Flex>
          </SchemeScope>
        </Drawer>
      </>
    )
  }

  return (
    <Popover
      placement="bottomRight"
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      styles={{ container: { padding: 0 } }}
    >
      {bell}
    </Popover>
  )
}

export default Notifications
