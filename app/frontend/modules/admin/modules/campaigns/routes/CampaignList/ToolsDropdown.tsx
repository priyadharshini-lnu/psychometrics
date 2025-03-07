import { FC } from 'react'
import {
  Button, message,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useParams } from 'react-router-dom'
import { getPermissions } from '~/core/currentUser'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { useResources } from '~/hooks/useResources/useResources'

const { I18n } = window

const connector = connect(
  state => ({
    permissions: getPermissions(state),
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  openModal(name: string, data: object): void
}

const ToolsDropdown: FC<Props> = ({ permissions, openModal }) => {
  const { projectId } = useParams() as { projectId: string }
  const { memberAction } = useResources('projects')

  const menuItems:ItemType[] = []
  permissions.workshopStatusExport && menuItems.push({
    key: 'workshopStatusExport',
    label: I18n.t('administration.project.tools.workshop_status_export'),
  })

  const exportWorkshopStatus = (id, body): Promise<unknown> => memberAction({
    id,
    action: 'workshop_status_export',
    body,
    method: 'get',
  })


  const handleMenuClick = ({ key }) => {
    if (key === 'workshopStatusExport') {
      openModal('UserFilterModal', {
        id: projectId,
        action: exportWorkshopStatus,
        onSuccess: () => { message.success(I18n.t('administration.project.tools.workshop_status_export_success')) },
      })
    }
  }

  const toolsMenu = {
    items: menuItems,
    onClick: handleMenuClick,
  }

  return (
    <ConditionalDropdown
      menu={toolsMenu}
      hideForEmptyMenu
      innerElement={(
        <Button>
          <ToolOutlined />
          <DownOutlined />
        </Button>
      )}
    />
  )
}

export default connector(ToolsDropdown)
