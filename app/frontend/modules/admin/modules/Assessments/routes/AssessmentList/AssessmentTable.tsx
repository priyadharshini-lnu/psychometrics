import React, { useState } from 'react'
import {
  Button, Menu, Switch, message,
} from 'antd'
import { useSelector } from 'react-redux'
import { get as getCurrentUser, hasGrant } from '~/core/currentUser'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { ConfirmationModal, ResourceAvatar } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import settings from '../../settings'
import { history } from '~/modules/admin/store'

const { I18n } = window

type Props = {
  openDrawer: (assessment: Assessment) => void
}

export const AssessmentTable: React.FC<Props> = ({
  openDrawer,
}) => (
  <Resource.Table pagination>
    <Resource.Column<Assessment>
      title={I18n.t('common.column.id')}
      id="id"
      sorter
      render={assessment => (
        <Button type="link" href={`/administration/assessments/${assessment.id}`}>
          {assessment.id}
        </Button>
      )}
    />
    <Resource.Column<Assessment>
      id="disabled"
      title={I18n.t('common.column.active')}
      render={assessment => <ActiveSwitch assessment={assessment} />}
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.icon')}
      id="icon"
      width={100}
      render={assessment => (
        <ResourceAvatar
          url={assessment.iconUrl}
          color={assessment.iconColor}
          name={assessment.name}
        />
      )}
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.name')}
      id="name"
      width={400}
      sorter
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.dimension')}
      id="dimension"
      width={300}
      render={(_, { dimension }) => dimension?.name}
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.owner')}
      id="owner"
      width={300}
      render={(_, { owner }) => owner?.name}
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.type')}
      id="type"
      width={300}
      sorter
      render={assessment => I18n.t(`assessments.fields.type.${assessment.type}`)}
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.category')}
      id="category"
      width={300}
      sorter
      // filters={
      // settings.categories.map((t: string) => ({ text: I18n.t(`assessments.fields.category.${t}`), value: t }))}
      // filteredValue={resource.getFilteredValue('category')}
      render={assessment => I18n.t(`assessments.fields.category.${assessment.category}`)}
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.updated_at')}
      id="updated_at"
      width={300}
      sorter
    />
    <Resource.Column<Assessment>
      title={I18n.t('common.column.action')}
      id="action"
      render={(_, assessment) => (
        <Dropdown
          assessment={assessment}
          openDrawer={openDrawer}
        />
      )}
    />
  </Resource.Table>
)


const ActiveSwitch: React.FC<{ assessment: Assessment }> = ({ assessment }) => {
  const { resource } = useResourceContext<Assessment>()
  return (
    <Switch
      checked={!assessment.disabled}
      onChange={() => {
        resource.updateResource({ id: assessment.id, disabled: !assessment.disabled })
      }}
    />
  )
}

type DropDownProps = {
  openDrawer: (assessment: Assessment) => void
  assessment: Assessment
}
const Dropdown: React.FC<DropDownProps> = (
  { assessment, openDrawer },
) => {
  const [confirmation, setConfirmation] = useState(false)
  return (
    <ConditionalDropdown
      menu={ActionsMenu({
        assessment, setConfirmation, confirmation, openDrawer,
      }) as React.ReactElement}
    />
  )
}

interface ActionMenuProps {
  assessment: Assessment
  setConfirmation: (confirmation: boolean) => void
  confirmation: boolean
  openDrawer: (assessment: Assessment) => void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  setConfirmation, confirmation, assessment, openDrawer,
}) => {
  const { resource } = useResourceContext<Assessment>()
  const currentUser = useSelector(getCurrentUser)

  const handleOnConfirm = () => resource.removeResource(assessment.id).then(() => {
    message.info(I18n.t('assessments.actions.remove.success_message', { name: assessment.name }))
  }).catch(e => message.error(JSON.stringify(e)))

  const menuItems = [
    {
      key: 'details',
      label: (
        <Button type="link" onClick={() => openDrawer(assessment)} className="ps-0">
          {I18n.t('assessments.actions.details')}
        </Button>),
    },
    hasGrant(currentUser, 'assessments', 'manage') && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => history.push(`${settings.urlPrefix}/${assessment.id}/edit`)}
          className="ps-0"
        >
          {I18n.t('assessments.actions.edit')}
        </Button>),
    },
    {
      key: 'show_usage',
      label: (
        <Button type="link" className="ps-0" disabled>
          {I18n.t('assessments.actions.show_usage')}
        </Button>),
    },
    hasGrant(currentUser, 'assessments', 'manage') && {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
          {confirmation && (
            <ConfirmationModal
              title={I18n.t('assessments.actions.remove.confirm_title')}
              message={I18n.t('assessments.actions.remove.confirm_message', { name: assessment.name })}
              onConfirm={handleOnConfirm}
              onCancel={() => setConfirmation(false)}
            />
          )}
        </>
      ),
    },
  ].filter(m => m)

  return (<Menu items={menuItems} />)
}
