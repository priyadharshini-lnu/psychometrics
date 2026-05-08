import React, { FC } from 'react'
import {
  Button, MenuProps,
  Switch,
  Tag,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import dayjs from '~/utils/dayjs'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Factor, FactorTR } from '~/modules/admin/modules/campaigns/core/factors'
import { ResourceAvatar } from '~/glint/components/ResourceAvatar/ResourceAvatar'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const FactorsTable: FC<Props> = ({ openModal }) => (
  <>
    <Resource.Table pagination>
      <Resource.Column<Factor>
        title={I18n.t('common.column.id')}
        id="id"
        sorter
        render={factor => factor.id}
        width={100}
      />
      <Resource.Column<Factor>
        title={I18n.t('common.column.active')}
        id="active"
        render={factor => <ActiveSwitch factor={factor} />}
        width={10}
      />
      <Resource.Column<Factor>
        title={I18n.t('common.column.icon')}
        id="icon"
        render={factor => (
          <ResourceAvatar
            url={factor.iconUrl}
            name={factor.name || ''}
          />
        )}
        width={70}
      />
      <Resource.Column<Factor>
        title={I18n.t('common.column.name')}
        id="name"
        sorter
        width={200}
      />
      <Resource.Column<Factor>
        title={I18n.t('simple_form.placeholders.factor.questions_count')}
        id="questions_count"
        render={(factor) => {
          if (factor?.questionsCountByAssessmentDetails?.length) {
            return factor.questionsCountByAssessmentDetails.map(({ assessmentId, assessmentName, count }) => (
              <div key={`${factor.id}-${assessmentId}`}>
                <Button
                  type="link"
                  href={`/administration/assessments/${assessmentId}/scoring?factor_id=${factor.id}`}
                >
                  {assessmentName ? `${assessmentName} - [${count}]` : `- [${count}]`}
                </Button>
              </div>
            ))
          }

          return factor?.questionsCount
        }}
        width={140}
      />
      <Resource.Column<Factor>
        title={I18n.t('administration.factors.index.scoring_strategy')}
        id="scoring_strategy"
        sorter
        render={factor => I18n.t(`administration.factors.index.scoring_strategies.${factor.scoringStrategy}`)}
        width={100}
      />
      <Resource.Column<Factor>
        title={I18n.t('administration.factors.index.sub_factors')}
        width={60}
        id="sub_factors"
        render={factor => (
          factor?.subFactors?.map(fact => (
            <div key={fact.id}><Tag color="green">{fact.name}</Tag></div>
          ))
        )}
      />
      <Resource.Column<Factor>
        title={I18n.t('common.column.created_at')}
        id="created_at"
        dataIndex="createdAt"
        sorter
        render={createdAt => (
          dayjs(createdAt).format('lll')
        )}
        align="center"
        width={100}
      />
      <Resource.Column<Factor>
        title={I18n.t('common.column.updated_at')}
        id="updated_at"
        dataIndex="updatedAt"
        sorter
        render={updatedAt => (
          dayjs(updatedAt).format('lll')
        )}
        align="center"
        width={100}
      />
      <Resource.Column<Factor>
        title={I18n.t('common.column.action')}
        id="action"
        render={(_, factor) => (
          <Dropdown
            factor={factor}
            openModal={openModal}
          />
        )}
        width={100}
      />
    </Resource.Table>
  </>
)
type DropDownProps = {
  factor: Factor,
  openModal: (modalName: string, modalProps?: unknown) => void
}

const Dropdown: React.FC<DropDownProps> = ({ factor, openModal }) => {
  const { resource } = useResourceContext<Factor>()

  const copyFactor = async () => {
    await resource.memberAction({
      id: factor.id,
      action: 'copy',
      method: 'post',
      updateStore: true,
      responseType: FactorTR,
    })
  }

  return (
    <ConditionalDropdown
      menu={getActionsMenuProps({ factor, openModal, copyFactor })}
    />
  )
}

const getActionsMenuProps = ({
  factor,
  openModal,
  copyFactor,
}: DropDownProps & { copyFactor: () => Promise<void> }): MenuProps => {
  const canCopy = factor?.meta?.permissions?.copy
  const menuItems = [
    factor && {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => openModal('FactorsFormModal', { factor })}
          className="ps-0"
        >
          {I18n.t('common.actions.edit')}
        </Button>),
    },
    factor && {
      key: 'remove',
      label: (
        <Button
          type="link"
          onClick={() => openModal('RemoveFactorModal', { factor })}
          className="ps-0"
        >
          {I18n.t('common.actions.remove')}
        </Button>),
    },
    canCopy && {
      key: 'copy',
      label: (
        <Button
          type="link"
          onClick={copyFactor}
          className="ps-0"
        >
          {I18n.t('common.actions.copy')}
        </Button>),
    },
  ].filter(m => m) as ItemType[]

  return ({ items: menuItems })
}

const ActiveSwitch: React.FC<{ factor: Factor }> = ({ factor }) => {
  const [loading, setLoading] = React.useState(false)
  const [displayedDisabled, setDisplayedDisabled] = React.useState(factor.disabled)
  const { resource } = useResourceContext<Factor>()

  React.useEffect(() => {
    setDisplayedDisabled(factor.disabled)
  }, [factor.disabled])

  const handleToggle = () => {
    setLoading(true)
    resource.updateResource({ id: factor.id, disabled: !displayedDisabled }).then(() => {
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }

  return (
    <Switch
      checked={!displayedDisabled}
      onChange={handleToggle}
      disabled={loading}
    />
  )
}
