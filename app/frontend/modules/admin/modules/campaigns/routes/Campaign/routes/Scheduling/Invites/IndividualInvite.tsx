import { Menu } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

import { useDispatch } from 'react-redux'
import { Event, Mail } from '@thetalententerprise/glint/icons'
import settings from '~/modules/admin/modules/campaigns/settings'
import { SubjectList } from './Subjects/SubjectList'
import { WorkshopList } from './Workshops/WorkshopList'
import InviteDetails from './InviteDetails'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { useResources } from '~/hooks/useResources'
import routeUtils from '~/utils/route'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import Modals from '~/modules/admin/components/Modals'
import { InviteEditFormModal } from './InviteEditFormModal'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

const MODALS = {
  InviteEditFormModal,
}

export const IndividualInvite = () => {
  const {
    inviteId, campaignId, tabName,
  } = useParams() as { inviteId: string, campaignId: string, tabName: string }
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    fetchSingle, updateResource, getResource, meta,
  } = useResources<WorkshopInvite, BaseMeta>(
    'workshop_invites',
    {
      basePath: `/campaigns/${campaignId}`,
      apiConfig: {
        include_meta: ['permissions'],
      },
    },
  )


  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling/invites/${inviteId}`
  const workshopInvite = getResource(inviteId)
  useEffect(() => {
    fetchSingle({ id: inviteId })
  }, [])

  const handleUpdate = () => {
    dispatch(openModal('InviteEditFormModal', {
      workshopInvite,
      updateWorkshopInvite: updateResource,
    }))
  }

  return (
    <>
      <div className="p-6">
        {workshopInvite && (
          <InviteDetails
            updateWorkshopInvite={handleUpdate}
            workshopInvite={workshopInvite}
            permissions={meta?.permissions}
          />
        )}
      </div>
      <Menu
        items={[
          {
            key: 'subjects',
            icon: <Mail />,
            label: I18n.t('admin.individual_invite_tabs_invitation_status'),
          },
          {
            key: 'assessment_center',
            icon: <Event />,
            label: I18n.t('admin.individual_invite_tabs_assessment_center'),
          },
        ]}
        onSelect={({ key }) => routeUtils.moveTo(navigate, prefixPath, `/${key}`, true)}
        selectedKeys={tabName ? [tabName] : []}
        mode="horizontal"
      />
      {tabName === 'assessment_center' ? <WorkshopList /> : <SubjectList />}
      <Modals modals={MODALS} />
    </>
  )
}
