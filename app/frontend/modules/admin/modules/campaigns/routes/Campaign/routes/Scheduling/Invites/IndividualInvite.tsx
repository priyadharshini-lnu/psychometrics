import { Space, PageHeader, Tabs } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import {
  MailOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useEffect } from 'react'
import styles from './styles.less'

import settings from '~/modules/admin/modules/campaigns/settings'
import { SubjectList } from './Subjects/SubjectList'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { useResources } from '~/hooks/useResources'
import routeUtils from '~/utils/route'

const { I18n } = window

export const IndividualInvite = () => {
  const { inviteId, campaignId, tabName } = useParams<{ inviteId: string, campaignId: string, tabName: string }>()
  const history = useHistory()
  const { fetchSingle, getResource } = useResources<WorkshopInvite>('workshop_invites')
  const workshopInvite = getResource(inviteId)
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling/invites/${inviteId}`

  useEffect(() => {
    fetchSingle({ id: inviteId, apiConfig: { fields: { workshop_invites: ['title'] } } })
  }, [])

  return (
    <>
      <PageHeader
        className={styles.pageHeader}
        onBack={() => history.goBack()}
        title={(
          <>
            <Space>
              {workshopInvite?.title}
            </Space>
          </>
        )}
      />
      <Tabs
        size="large"
        tabBarStyle={{ paddingLeft: '10px' }}
        onTabClick={tab => routeUtils.moveTo(history, prefixPath, `/${tab}`, true)}
        activeKey={tabName}
        destroyInactiveTabPane
        items={[
          {
            key: 'subjects',
            label: (
              <>
                <MailOutlined />
                {I18n.t('administration.individual_invite.tabs.subjects')}
              </>
            ),
            children: <SubjectList />,
          },
          {
            key: 'cancellation_rescheduling',
            label: (
              <>
                <CloseCircleOutlined />
                {I18n.t('administration.individual_invite.tabs.cancellation_reschedule')}
              </>
            ),
          },
          {
            key: 'assessment_center',
            label: I18n.t('administration.individual_invite.tabs.assessment_center'),
          },
        ]}
      />
    </>
  )
}
