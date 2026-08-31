import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import {
  MenuProps, message, Space,
} from 'antd'
import { RemoveResource } from 'hooks/useResources/interfaces'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Idp } from '~/modules/admin/modules/client/core/idp'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import IdpFilter from './IdpFilter'
import IDPTemplateForm from './IDPTemplateForm'
import Modals from '~/modules/admin/components/Modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import RemoveIdTemplate from './RemoveIdpTemplateModal'
import { getClientId } from '~/modules/admin/modules/client/core/projects'

const { I18n } = window

const MODALS = {
  IDPTemplateForm,
  RemoveIdTemplate,
}

const connector = connect(
  (state: RootState) => ({
    clientId: getClientId(state),
    aiAssistedIdpFeatureEnabled: state.config.project.aiAssistedIdpFeatureEnabled,
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

const IdpTable: React.FC<Props> = ({ openModal, clientId, aiAssistedIdpFeatureEnabled }) => {
  const { resource } = useResourceContext<Idp>()
  const { getSortOrder, removeResource } = resource
  const { projectId } = useParams() as { projectId: string }
  const navigate = useNavigate()

  const publish = (idp: Idp, status) => {
    resource.updateResource({ id: idp.id, status }).then(() => {
      message.success(I18n.t('admin.idp_status_updated'))
    }).catch((error) => {
      message.error(error?.skillsId?.title || error?.base?.[0]?.title)
    })
  }

  return (
    <>
      <IdpFilter openModal={() => openModal('IDPTemplateForm', { projectId, clientId, aiAssistedIdpFeatureEnabled })} />
      <Resource.Table pagination>
        <Resource.Column<Idp>
          title={I18n.t('shared.id')}
          dataIndex="id"
          id="id"
          width={100}
          sorter
          sortOrder={getSortOrder('id')}
          fixed="left"
        />
        <Resource.Column<Idp>
          title={`${I18n.t('shared.name')}`}
          id="name"
          hideable={false}
          render={item => <Link to={`/admin/projects/${projectId}/idp/templates/${item.id}`}>{item?.name}</Link>}
          sorter
          fixed="left"
        />

        <Resource.Column<Idp>
          title={`${I18n.t('shared.description')}`}
          id="description"
          render={item => item?.description}
          sorter
        />

        <Resource.Column<Idp>
          title={`${I18n.t('admin.idp_skill_gap_report')}`}
          id="description"
          render={item => item?.report?.name}
        />

        <Resource.Column<Idp>
          title={`${I18n.t('shared.status')}`}
          id="published"
          render={item => (
            <Space>
              {I18n.t(`admin.idp_status_${item.status}`)}
            </Space>
          )}
        />

        <Resource.Column<Idp>
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          width={100}
          render={idp => (
            <ConditionalDropdown
              menu={
                getActionMenuProps({
                  openModal,
                  idp,
                  removeResource,
                  projectId,
                  clientId,
                  navigate,
                  publish,
                })
              }
            />
          )}
          fixed="right"
        />
      </Resource.Table>
      <Modals modals={MODALS} />
    </>
  )
}

interface ActionMenuData {
  idp: Idp,
  openModal: (modalName: string, modalProps: unknown) => void,
  removeResource: RemoveResource,
  projectId: string,
  clientId: string,
  navigate: ReturnType<typeof useNavigate>,
  publish: (idp: Idp, status: string) => void,
}

const getActionMenuProps = ({
  idp,
  openModal,
  removeResource,
  projectId,
  navigate,
  publish,
}: ActionMenuData): MenuProps => {
  const menuItems = [
    idp.meta?.permissions?.edit && { key: 'edit', label: I18n.t('shared.edit') },
    idp.meta?.permissions?.publish && idp.status === 'draft' ? {
      key: 'publish', label: I18n.t('shared.publish'),
    } : null,
    idp.meta?.permissions?.unpublish && idp.status === 'published' ? {
      key: 'unpublish', label: I18n.t('shared.unpublish'),
    } : null,
    idp.meta?.permissions?.remove && { key: 'remove', label: I18n.t('shared.remove') },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      navigate(`/admin/projects/${projectId}/idp/templates/${idp.id}`)
    }
    if (key === 'publish') {
      publish(idp, 'published')
    }
    if (key === 'unpublish') {
      publish(idp, 'draft')
    }
    if (key === 'remove') {
      return openModal('RemoveIdTemplate', { idp, removeIdp: removeResource })
    }
    return null
  }

  return ({ items: _.compact(menuItems), onClick: handleMenuClick })
}

export default connector(IdpTable)
