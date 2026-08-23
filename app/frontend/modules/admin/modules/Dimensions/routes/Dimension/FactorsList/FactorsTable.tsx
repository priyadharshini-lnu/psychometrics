import React, { FC, useState } from 'react'
import {
  Button, MenuProps,
  Switch,
  Tag,
  Drawer,
  Space,
  Empty,
} from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { ArrowRightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Factor, FactorTR } from '~/modules/admin/modules/campaigns/core/factors'
import { ResourceAvatar } from '~/glint/components/ResourceAvatar/ResourceAvatar'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

interface QuestionsDetail {
  assessmentId: string
  assessmentName?: string
  count: number
}

const { I18n } = window

export const FactorsTable: FC<Props> = ({ openModal }) => {
  const [questionsDrawerOpen, setQuestionsDrawerOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionsDetail[] | null>(null)

  const handleViewAllQuestions = (questions: QuestionsDetail[]) => {
    setSelectedQuestions(questions)
    setQuestionsDrawerOpen(true)
  }

  return (
    <>
      <Resource.Table pagination>
        <Resource.Column<Factor>
          title={I18n.t('shared.id')}
          id="id"
          hideable={false}
          sorter
          render={factor => factor.id}
          width={100}
          fixed="left"
        />
        <Resource.Column<Factor>
          title={I18n.t('shared.active')}
          id="active"
          render={factor => <ActiveSwitch factor={factor} />}
          width={10}
          fixed="left"
        />
        <Resource.Column<Factor>
          title={I18n.t('shared.icon')}
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
          title={I18n.t('shared.name')}
          id="name"
          sorter
          width={200}
        />
        <Resource.Column<Factor>
          title={I18n.t('simple_form.placeholders.factor.questions_count')}
          id="questions_count"
          render={(factor) => {
            if (factor?.questionsCountByAssessmentDetails?.length) {
              const allQuestions = factor.questionsCountByAssessmentDetails
              const hasMore = allQuestions.length > 3
              const visibleCount = hasMore ? 2 : 3
              const visibleQuestions = allQuestions.slice(0, visibleCount)
              const hiddenCount = allQuestions.length - visibleCount

              return (
                <>
                  {visibleQuestions.map(({ assessmentId, assessmentName, count }) => (
                    <div key={`${factor.id}-${assessmentId}`} style={{ marginBottom: '4px' }}>
                      <Button
                        type="link"
                        href={`/administration/assessments/${assessmentId}/scoring?factor_id=${factor.id}`}
                        style={{ padding: 0 }}
                      >
                        {assessmentName ? `${assessmentName} - [${count}]` : `- [${count}]`}
                      </Button>
                    </div>
                  ))}
                  {hasMore && (
                    <Button
                      size="small"
                      onClick={() => handleViewAllQuestions(allQuestions)}
                    >
                      {`+${hiddenCount}`}
                    </Button>
                  )}
                </>
              )
            }

            return factor?.questionsCount
          }}
          width={140}
        />
        <Resource.Column<Factor>
          title={I18n.t('admin.factors_index_scoring_strategy')}
          id="scoring_strategy"
          sorter
          render={factor => I18n.t(`admin.${factor.scoringStrategy}`)}
          width={100}
        />
        <Resource.Column<Factor>
          title={I18n.t('admin.factors_index_sub_factors')}
          width={60}
          id="sub_factors"
          render={factor => (
            factor?.subFactors?.map(fact => (
              <div key={fact.id}><Tag color="green">{fact.name}</Tag></div>
            ))
          )}
        />
        <Resource.Column<Factor>
          title={I18n.t('shared.created_at')}
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
          title={I18n.t('shared.updated_at')}
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
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          render={(_, factor) => (
            <Dropdown
              factor={factor}
              openModal={openModal}
            />
          )}
          width={100}
          fixed="right"
        />
      </Resource.Table>
      <Drawer
        title={I18n.t('simple_form.placeholders.factor.questions_count')}
        placement="right"
        closable
        onClose={() => setQuestionsDrawerOpen(false)}
        open={questionsDrawerOpen}
        width="50%"
        footer={(
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setQuestionsDrawerOpen(false)}>
              {I18n.t('shared.cancel')}
            </Button>
          </Space>
        )}
      >
        {selectedQuestions && selectedQuestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {selectedQuestions.map(({ assessmentId, assessmentName, count }) => (
              <a
                key={`${assessmentId}`}
                href={`/administration/assessments/${assessmentId}/scoring`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 8px',
                  textDecoration: 'none',
                  color: '#0066cc',
                  borderBottom: '1px solid #d9d9d9',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>{assessmentName ? `${assessmentName} - [${count}]` : `- [${count}]`}</span>
                <ArrowRightOutlined style={{ marginLeft: '16px', flexShrink: 0, color: '#999' }} />
              </a>
            ))}
          </div>
        ) : (
          <Empty description={I18n.t('shared.no_results_found')} />
        )}
      </Drawer>
    </>
  )
}
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
          {I18n.t('shared.edit')}
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
          {I18n.t('shared.remove')}
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
          {I18n.t('shared.copy')}
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
