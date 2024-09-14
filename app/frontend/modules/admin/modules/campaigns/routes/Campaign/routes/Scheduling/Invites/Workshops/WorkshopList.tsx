import {
  Button, App,
} from 'antd'
import { useParams } from 'react-router-dom'

import {
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { ConnectedProps, connect } from 'react-redux'
import { WorkshopShort, WorkshopShortTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { WorkshopAddFormModal } from './WorkshopAddFormModal'
import { formatWorkshopDate } from '~/utils/workshop'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

const connector = connect(null, { openModal })
type Props = ConnectedProps<typeof connector>

export const WorkshopListComponent:React.FC<Props> = ({ openModal }) => {
  const { inviteId, campaignId } = useParams() as { inviteId: string, campaignId: string }

  return (
    <>
      <Resource
        config={{
          basePath: `campaigns/${campaignId}/workshop_invites/${inviteId}`,
          trackUrl: true,
          responseType: WorkshopShortTR,
          apiConfig: {
            fields: { workshops: ['id', 'start_time'] },
          },
        }}
        name="workshops"
      >
        <Resource.Filter placeholder="Search" name="filterable_fields">
          <Button type="primary" onClick={() => openModal('WorkshopAddFormModal')}>
            <PlusOutlined />
            {' '}
            {I18n.t('administration.assessment_center.invite.workshop_list.add')}
          </Button>
        </Resource.Filter>
        <Resource.Table pagination>
          <Resource.Column<WorkshopShort>
            title={I18n.t('administration.assessment_center.invite.workshop_list.name')}
            id="startTime"
            sorter
            width="90%"
            render={(_, { startTime }) => formatWorkshopDate(startTime)}
          />
          <Resource.Column<WorkshopShort>
            id="remove"
            title={I18n.t('common.actions.remove')}
            render={(_, workshop) => <RemoveWorkshop campaignId={campaignId} inviteId={inviteId} workshop={workshop} />}
          />
        </Resource.Table>
        <Modals modals={{ WorkshopAddFormModal }} />
      </Resource>
    </>
  )
}

const RemoveWorkshop: React.FC<{ workshop: WorkshopShort, campaignId:string, inviteId:string }> = ({
  campaignId, inviteId, workshop,
}) => {
  const { removeRelationships } = useResources<WorkshopInvite>('workshop_invites', {
    basePath: `campaigns/${campaignId}/workshop_invites/${inviteId}`,
  })
  const { message, modal } = App.useApp()

  const { resource } = useResourceContext<WorkshopShort>()

  const removeWorkshop = ({ id, startTime }: WorkshopShort) => {
    modal.confirm({
      title: I18n.t('administration.assessment_center.invite.workshop_list.remove_confirm.title'),
      content: I18n.t('administration.assessment_center.invite.workshop_list.remove_confirm.content',
        { name: formatWorkshopDate(startTime) }),
      onOk: () => {
        removeRelationships('workshops', [id]).then(() => {
          message.success(I18n.t('administration.assessment_center.invite.workshop_list.remove_confirm.success'))
          resource.setData(resource.data.filter(r => r.id !== id))
        })
      },
    })
  }

  return <CloseOutlined onClick={() => removeWorkshop(workshop)} />
}

export const WorkshopList = connector(WorkshopListComponent)
