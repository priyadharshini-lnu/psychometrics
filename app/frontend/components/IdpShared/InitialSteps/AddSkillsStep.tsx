import {
  useContext, useState, FC, ReactNode,
} from 'react'
import {
  Row, Col, Space, Modal, Button,
} from 'antd'
import { ButtonWithArrow, BoxWithShadow, MediaQueryContext } from '~/glint'
import { SelectedSkillsCard } from '~/components/IdpShared/InitialSteps/SelectedSkillsCard'
import { SkillsGroupCard } from '~/components/IdpShared/InitialSteps/SkillsGroupCard'
import { type Skill, type CategoryWithSkills } from '../DevelopmentActions'

type AddSkillsStepProps = {
  onFinishAddSkill: () => void
  addSkillButtonText: string
  selectedSkills: Skill[]
  skillCategories: CategoryWithSkills[]
  onDeselectSkill: (id: number) => void
  onAddSkill: (skills: { id: number; name: string }[]) => void
}

const { I18n } = window


export const AddSkillsStep: FC<AddSkillsStepProps> = ({
  onFinishAddSkill, addSkillButtonText, skillCategories, selectedSkills, onDeselectSkill, onAddSkill,
}) => {
  const { isMobile } = useContext(MediaQueryContext)
  const [openSelectedSkillsModal, setOpenSelectedSkillsModal] = useState(false)

  const selectedSkillsIds = selectedSkills.map(({ id }) => id)

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={{ span: 24 }} sm={{ span: 18 }}>
          <Space size={24} className="w-100" direction="vertical">
            {
            skillCategories.map((skillCategory) => {
              const skillsAvailableForSelection = skillCategory.skills.filter(
                skill => !selectedSkillsIds.includes(skill.id),
              )
              return (
                <SkillsGroupCard
                  key={skillCategory.category}
                  skillCategory={{ category: skillCategory.category, skills: skillsAvailableForSelection }}
                  onAddSkill={onAddSkill}
                />
              )
            })
          }
          </Space>
        </Col>
        <SelectedSkillsCardResponsiveWrapper
          onClose={() => setOpenSelectedSkillsModal(false)}
          openSelectedSkillsModal={openSelectedSkillsModal}
        >
          <SelectedSkillsCard OnRemoveSkill={onDeselectSkill} selectedSkills={selectedSkills} />
        </SelectedSkillsCardResponsiveWrapper>
      </Row>
      <Row justify="space-between" className="mt-6">
        <Col span={12}>
          {isMobile ? (
            <Button
              size="small"
              onClick={() => setOpenSelectedSkillsModal(true)}
              ghost
              type="primary"
              className="w-100"
            >
              {`${I18n.t('idp.initial_steps.selected_skills')} (${selectedSkills.length})`}
            </Button>
          ) : null}
        </Col>
        <Col>
          <ButtonWithArrow
            label={addSkillButtonText}
            size="small"
            type="primary"
            onClick={() => onFinishAddSkill()}
          />
        </Col>
      </Row>
    </>
  )
}

type SelectedSkillsCardResponsiveWrapperProps = {
  children: ReactNode
  openSelectedSkillsModal: boolean
  onClose: () => void

}

const SelectedSkillsCardResponsiveWrapper:FC<SelectedSkillsCardResponsiveWrapperProps> = (
  { children, openSelectedSkillsModal, onClose },
) => {
  const { isMobile } = useContext(MediaQueryContext)

  if (isMobile) {
    return (
      <Modal
        style={{ top: 0, margin: 0 }}
        styles={{ content: { padding: '0px', height: '100vh', width: '100vw' } }}
        onCancel={onClose}
        closable
        footer={null}
        open={openSelectedSkillsModal}
      >
        {children}
      </Modal>
    )
  }

  return (
    <Col flex="auto">
      <BoxWithShadow>
        {children}
      </BoxWithShadow>
    </Col>
  )
}
