/* eslint-disable max-len */

import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { PageHeader } from '@ant-design/pro-components'
import { Tabs } from 'antd'
import { useParams } from 'react-router-dom'
import { getCurrent, fetchSingle } from '~/modules/admin/modules/AssessorApp/core/users'
import { get as getUserAssessments } from '~/modules/admin/modules/AssessorApp/core/userAssessments'
import { get as getUserRecordings } from '~/modules/admin/modules/AssessorApp/core/userRecordings'

import { RootState } from '~/modules/admin/core/rootReducers'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import styles from './styles.less'
import Assessments from './Assessments'
import Recordings from './Recordings'

const connecter = connect(
  (state: RootState) => ({
    user: getCurrent(state),
    userAssessments: getUserAssessments(state),
    userRecordings: getUserRecordings(state),
  }),
  {
    fetchSingle,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { I18n } = window

const UserDetails: React.FC<Props> = (
  {
    user,
    fetchSingle,
  },
) => {
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  let parsedCampaignId; let
    parsedUserId: null | number = null
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  const [tab, setTab] = useState('assessments')

  const changeTab = (tab) => {
    setTab(tab)
  }

  useEffect(() => {
    if (parsedCampaignId && parsedUserId) { fetchSingle(parsedCampaignId, parsedUserId) }
  }, [])

  if (!parsedCampaignId || !user) { return null }

  const tabs = [
    {
      key: 'assessments',
      label: I18n.t('assessments_reports.menu.assessments_and_reports'),
    },
    {
      key: 'recordings',
      label: I18n.t('assessments_reports.menu.recordings'),
    },
  ]

  return (
    <>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: { campaignId: parsedCampaignId },
        }}
        crumbs={[{
          link: () => '/assessors',
          label: () => I18n.t('common.model.campaigns'),
        }, {
          label: state => state.campaign.name,
          link: () => `/assessors/campaigns/${campaignId}/users`,
        },
        {
          label: () => user?.email,
        },
        ]}
      />
      <PageHeader
        ghost={false}
        title={<h1 className="fs-32 mt-0 mb-0">{user.fullName}</h1>}
        subTitle={user.email}
      />
      <div className="pl">
        <Tabs
          activeKey={tab}
          onChange={changeTab}
          defaultActiveKey="assessments"
          className={styles.tabs}
          items={tabs}
        />
        {tab === 'assessments' && <Assessments />}
        {tab === 'recordings' && <Recordings />}

      </div>
    </>
  )
}

export default connecter(UserDetails)
