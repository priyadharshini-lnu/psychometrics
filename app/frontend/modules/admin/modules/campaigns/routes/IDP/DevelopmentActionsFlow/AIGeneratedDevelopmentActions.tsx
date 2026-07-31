import { FC, useEffect, useState } from 'react'
import {
  Button,
  Flex, Modal, Spin,
} from 'antd'
import { SyncOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BoxWithShadow, ButtonWithArrow } from '~/glint'
import { AIGeneratedDevelopmentActionsList } from '~/components/IdpShared/DevelopmentActions/Common'
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
  selectedAIGeneratedDevelopmentActions: DevelopmentAction[]
}

export const AIGeneratedDevelopmentActions: FC<AIGeneratedDevelopmentActionsProps> = ({
  onAddDevelopmentAction,
  onCancel,
  open,
  skill,
  selectedAIGeneratedDevelopmentActions,
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
        user_idp_skill_id: skill.id, // skill here is user_idp_skill
        lang: 'en',
        generate_more,
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
      selectedAIGeneratedDevelopmentActions={selectedAIGeneratedDevelopmentActions}
      skill={skill}
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
  selectedAIGeneratedDevelopmentActions,
  skill,
}) => {
  const [selectedDA, setSelectedDA] = useState<Partial<DevelopmentAction>[]>([])

  const handleGenerateMoreActions = () => {
    fetchDevelopmentActions(true)
  }

  const onAddDA = () => {
    onAddDevelopmentAction(selectedDA)
  }

  return (
    <Modal
      title={(
        <>
          <span className="font-normal">
            {I18n.t('admin.idp_development_actions_create_development_actions_with_ai')}
          </span>
          <span className="font-bold">
            {` ${skill?.name}`}
          </span>
        </>
      )}
      open={open}
      onCancel={onCancel}
      footer={!!developmentActions.length && [
        <Flex vertical>
          <Button
            key="generate_more"
            type="link"
            loading={isLoading}
            onClick={handleGenerateMoreActions}
            icon={<SyncOutlined spin={isLoading} />}
          >
            {I18n.t('idp.development_actions.generate_more')}
          </Button>
          <ButtonWithArrow
            label="Add"
            size="small"
            type="primary"
            disabled={isLoading}
            style={{
              width: '80px',
              alignSelf: 'flex-end',
            }}
            onClick={onAddDA}
          />
        </Flex>,
      ]}
      width={800}
    >
      <Spin
        spinning={isLoading}
        description={I18n.t('idp.development_actions.generating_development_actions')}
        size="large"
      >
        <Flex
          vertical
          gap={18}
          // style={{
          //   fontSize: '16px',
          // }}
        >
          <BoxWithShadow>
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
