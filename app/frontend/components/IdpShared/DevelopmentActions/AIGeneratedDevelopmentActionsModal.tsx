import React, { useEffect, useState } from 'react'
import {
  Button, message,
  Flex, Modal, Spin,
} from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { BoxWithShadow } from '~/glint'
import { DevelopmentAction, UserIdpSkill } from './Types'
import { DevelopmentActionsList } from './Common'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  generateDevelopmentActionsByAI,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

const { I18n } = window

type ManualProps = {
  onAddDevelopmentAction: (developmentAction: Partial<DevelopmentAction>) => void,
  onCancel: () => void,
  open: boolean,
  skill: UserIdpSkill | null
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
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const developmentActions = skill?.skillId ? generatedDevelopmentActions[skill.skillId] ?? [] : []

  const fetchAIGeneratedDevelopmentActions = (generateMore = false) => {
    if (skill) {
      setIsLoading(true)
      generateDevelopmentActionsByAI({
        userIdpSkillId: skill.id as number,
        generateMore,
        generatedActions: developmentActions,
        lang: I18n.locale,
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

  useEffect(() => {
    if (open && !developmentActions.length) {
      fetchAIGeneratedDevelopmentActions()
    }
  }, [open])

  return (
    <Modal
      title={I18n.t('idp.development_actions.generate_by_ai')}
      open={open}
      onCancel={onCancel}
      footer={!!developmentActions.length && [
        <Flex justify="center" align="middle">
          <Button
            key="generate_more"
            type="link"
            loading={isLoading}
            onClick={handleGenerateMoreActions}
            icon={<SyncOutlined spin={isLoading} />}
          >
            {I18n.t('idp.development_actions.generate_more')}
          </Button>
        </Flex>,
      ]}
      width={800}
    >
      <Spin spinning={isLoading} tip={I18n.t('idp.development_actions.generating_development_actions')} size="large">
        <Flex vertical gap={18}>
          <BoxWithShadow>
            <DevelopmentActionsList
              availableActions={developmentActions}
              onDevelopmentActionClick={onAddDevelopmentAction}
              highlightNewlyAddedActions
            />
          </BoxWithShadow>
        </Flex>
      </Spin>
    </Modal>
  )
}

export const AIGeneratedDevelopmentActionsModal = connector(AIGeneratedDevelopmentActionsModalComponent)
