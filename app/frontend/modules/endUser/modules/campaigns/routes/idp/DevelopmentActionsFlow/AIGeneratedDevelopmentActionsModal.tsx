import React, { useEffect, useState, useRef } from 'react'
import {
  Button, message,
  Flex, Spin, Typography, Modal,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import {
  SyncOutlined,
  CloseOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  ButtonWithArrow, BoxWithShadow,
} from '~/glint'
import { AvailableDevelopmentActions, DevelopmentAction, UserIdpSkill }
  from '~/components/IdpShared/DevelopmentActions/Types'
import { AIGeneratedDevelopmentActionsList } from '~/components/IdpShared/DevelopmentActions/Common'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  generateDevelopmentActionsByAI,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

const { I18n } = window

type ManualProps = {
  onAddDevelopmentAction: (developmentAction: Partial<AvailableDevelopmentActions | DevelopmentAction>[]) => void,
  onCancel: () => void,
  open: boolean,
  skill: UserIdpSkill | null,
  selectedAIGeneratedDevelopmentActions: Partial<AvailableDevelopmentActions | DevelopmentAction>[]
  userId: number | string | null,
  wrapClassName?: string;
}
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & ManualProps

const connector = connect((state: RootState) => ({
  generatedDevelopmentActions: state.campaigns.idp.AIGeneratedDevelopmentActions,
}),
{
  generateDevelopmentActionsByAI,
})

const AIGeneratedDevelopmentActionsModalComponent: React.FC<Props> = ({
  onAddDevelopmentAction,
  onCancel,
  open,
  generatedDevelopmentActions,
  generateDevelopmentActionsByAI,
  skill,
  userId,
  selectedAIGeneratedDevelopmentActions,
  wrapClassName,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const developmentActions = skill?.skillId ? generatedDevelopmentActions[skill.skillId] ?? [] : []

  const [selectedDA, setSelectedDA] = useState<Partial<DevelopmentAction>[]>([])

  const btnRef = useRef<HTMLButtonElement | null>(null)

  const fetchAIGeneratedDevelopmentActions = (generateMore = false) => {
    if (skill) {
      setIsLoading(true)
      generateDevelopmentActionsByAI({
        userIdpSkillId: skill.id as number,
        generateMore,
        lang: I18n.locale,
        userId: userId || null,
      }).catch((error) => {
        message.error(error || I18n.t('common.errors.something_wrong'))
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  const handleGenerateMoreActions = () => {
    fetchAIGeneratedDevelopmentActions(true)
  }

  const onAddDA = () => {
    onAddDevelopmentAction(selectedDA)
    setSelectedDA([])
  }

  useEffect(() => {
    if (open && !developmentActions.length) {
      fetchAIGeneratedDevelopmentActions()
    }
  }, [open])

  return (
    <Modal
      title={(
        <>
          <span className="font-normal">
            {I18n.t('idp.development_actions.create_development_actions_with_ai')}
          </span>
          <span className="font-bold">
            {` ${skill?.name}`}
          </span>
        </>
      )}
      open={open}
      onCancel={onCancel}
      closeIcon={<Button style={{ border: 'none' }} ref={btnRef} icon={<CloseOutlined />} />}
      mask={{ closable: false }}
      footer={!!developmentActions.length && [
        <Flex vertical flex={1} align="end">
          <Button
            key="generate_more"
            type="link"
            loading={isLoading}
            onClick={handleGenerateMoreActions}
            style={{
              width: '80px',
              alignSelf: 'center',
            }}
            icon={<SyncOutlined spin={isLoading} />}
          >
            {I18n.t('idp.development_actions.generate_more')}
          </Button>
          <Flex flex={1} gap={4}>
            {selectedDA.length > 0 && (
              <Typography.Text>
                {I18n.t('enduser.selected_count', { count: selectedDA.length })}
              </Typography.Text>
            )}
            <ButtonWithArrow
              label={I18n.t('common.actions.add')}
              size="small"
              type="primary"
              disabled={isLoading || selectedDA.length === 0}
              style={{
                width: '80px',
              }}
              aria-label={I18n.t('idp.development_actions.add_selected_development_actions')}
              onClick={onAddDA}
            />
          </Flex>

        </Flex>,
      ]}
      width={800}
      wrapClassName={wrapClassName}
      afterOpenChange={(isOpen) => {
        if (isOpen && btnRef && btnRef?.current) {
          btnRef?.current?.focus()
        }
      }}
    >
      <Spin
        aria-live="polite"
        aria-label={I18n.t('idp.development_actions.generating_development_actions')}
        spinning={isLoading}
        tip={I18n.t('idp.development_actions.generating_development_actions')}
        size="large"
      >
        <Flex
          vertical
          gap={18}
          style={{
            fontSize: '1rem',
          }}
        >
          <BoxWithShadow style={{
            opacity: isLoading ? 0.2 : 1,
          }}
          >
            <AIGeneratedDevelopmentActionsList
              availableActions={developmentActions}
              highlightNewlyAddedActions
              selectedAIGeneratedDevelopmentActions={selectedAIGeneratedDevelopmentActions}
              selectedDA={selectedDA}
              setSelectedDA={setSelectedDA}
            />
          </BoxWithShadow>
        </Flex>
      </Spin>
    </Modal>
  )
}

export const AIGeneratedDevelopmentActionsModal = connector(AIGeneratedDevelopmentActionsModalComponent)
