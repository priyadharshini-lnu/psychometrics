import React, { FC } from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { SubFactors } from '~/modules/admin/modules/client/core/subFactors'
import dayjs from '~/utils/dayjs'
import { Resource } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void,
  slug: string
}

const CONDITION_MAP = {
  equal_to: '==',
  not_equal_to: '!=',
  less_then: '<',
  less_then_or_equal: '<=',
  greater_then: '>',
  greater_then_or_equal: '>=',
}

const { I18n } = window

export const SubFactorsTable: FC<Props> = ({ openModal, slug }) => (
  <>
    <Resource.Table pagination>
      <Resource.Column<SubFactors>
        title={I18n.t('shared.id')}
        id="id"
        sorter
        render={subFact => subFact?.id}
        width={100}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('shared.name')}
        id="name"
        sorter
        render={subFact => subFact.factorName}
        width={200}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('admin.occupations_factors_list_condition')}
        id="condition"
        sorter
        render={subFact => CONDITION_MAP[subFact.predicate]}
        width={300}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('admin.factors_form_value')}
        id="value"
        sorter
        render={subFact => subFact.value}
        width={150}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('admin.occupations_factors_list_position')}
        id="position"
        sorter
        render={subFact => subFact.position}
        width={300}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('shared.created_at')}
        id="created_at"
        dataIndex="createdAt"
        render={createdAt => (
          dayjs(createdAt).format('lll')
        )}
        width={200}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('shared.last_updated')}
        id="updated_at"
        dataIndex="updatedAt"
        render={updatedAt => (
          dayjs(updatedAt).format('lll')
        )}
        width={200}
      />
      <Resource.Column<SubFactors>
        title={I18n.t('shared.action')}
        id="action"
        render={(_, subFact) => (
          <Dropdown
            subFact={subFact}
            openModal={openModal}
            slug={slug}
          />
        )}
        width={100}
      />
    </Resource.Table>
  </>
)

type DropDownProps = {
  subFact: SubFactors,
  openModal: (modalName: string, modalProps?: unknown) => void,
  slug: string
}
const Dropdown: React.FC<DropDownProps> = ({ subFact, openModal, slug }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ subFact, openModal, slug })}
  />
)

const getActionsMenuProps = ({ subFact, openModal, slug }: DropDownProps): MenuProps => {
  const menuItems = [
    subFact && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal('SubFactorsFormModal', { subFact, slug })}
          className="ps-0"
        >
          {I18n.t('shared.edit')}
        </Button>),
    },
    subFact && {
      key: 'remove',
      label: (
        <Button
          type="link"
          onClick={() => openModal('RemoveSubFactorsModal', { subFact, slug })}
          className="ps-0"
        >
          {I18n.t('shared.remove')}
        </Button>),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}
