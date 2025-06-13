import { FC, useEffect, useState } from 'react'
import {
  Button,
  Flex, Modal, Spin,
} from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { BoxWithShadow } from '~/glint'
import { DevelopmentActionsList } from '~/components/IdpShared/DevelopmentActions/Common'
import { useResources } from '~/hooks/useResources'
import {
  DevelopmentAction,
  SkillWithDevelopmentActions,
} from '~/components/IdpShared/DevelopmentActions/Types'

const { I18n } = window

type AIGeneratedDevelopmentActionsProps = {
  onAddDevelopmentAction: (developmentAction: Partial<DevelopmentAction>) => void,
  onCancel: () => void,
  open: boolean,
  skill: SkillWithDevelopmentActions
}

export const AIGeneratedDevelopmentActions: FC<AIGeneratedDevelopmentActionsProps> = ({
  onAddDevelopmentAction,
  onCancel,
  open,
  skill,
}) => {
  const [generatedDA, setGeneratedDA] = useState({})

  const [isLoading, setIsLoading] = useState(false)

  const {
    collectionAction,
  } = useResources(
    'user_idp_development_actions',
  )

  const fetchAIGeneratedDevelopmentActions = (generate_more = false) => {
    setIsLoading(true)
    collectionAction({
      method: 'post',
      action: '/generate_by_ai/',
      body: {
        skill_id: skill.skillId,
        lang: 'en',
        generate_more,
        generated_actions: generatedDA[skill?.skillId] ?? [],
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).then((data:any) => {
      setGeneratedDA({ ...generatedDA, [skill?.skillId]: data.generatedActions })
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (open && !generatedDA[skill?.skillId]?.length && skill) {
      fetchAIGeneratedDevelopmentActions()
    }
  }, [open])

  return (
    <AIGeneratedDevelopmentActionsModal
      open={open}
      isLoading={isLoading}
      onAddDevelopmentAction={onAddDevelopmentAction}
      onCancel={onCancel}
      developmentActions={generatedDA[skill?.skillId] ?? []}
      fetchDevelopmentActions={fetchAIGeneratedDevelopmentActions}
    />
  )
}


const AIGeneratedDevelopmentActionsModal = ({
  developmentActions,
  fetchDevelopmentActions,
  isLoading,
  onAddDevelopmentAction,
  open,
  onCancel,
}) => {
  const handleGenerateMoreActions = () => {
    fetchDevelopmentActions(true)
  }

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
      <Spin
        spinning={isLoading}
        tip={I18n.t('idp.development_actions.generating_development_actions')}
        size="large"
      >
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
