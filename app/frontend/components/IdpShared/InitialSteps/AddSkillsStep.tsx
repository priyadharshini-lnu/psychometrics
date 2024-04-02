import {
  useContext, useState, FC, ReactNode,
} from 'react'
import {
  Row, Col, Space, Modal, Button,
} from 'antd'
import { ButtonWithArrow, BoxWithShadow, MediaQueryContext } from '~/glint'
import { SelectedSkillsCard } from '~/components/IdpShared/InitialSteps/SelectedSkillsCard'
import { SkillsGroupCard } from '~/components/IdpShared/InitialSteps/SkillsGroupCard'

// sample data
const selectedSkills = [
  { id: 1, name: 'Skill 1' },
  { id: 2, name: 'Skill 2' },
  { id: 3, name: 'Skill 3' },
]

const skillsGroups = [
  {
    id: 1,
    iconUrl: '',
    name: 'Skill Group 1',
    description: 'Skill Group 1 description',
    skills: [
      { id: 1, name: 'Skill 1' },
      { id: 2, name: 'Skill 2' },
      { id: 3, name: 'Skill 3' },
    ],
  },
  {
    id: 2,
    iconUrl: '',
    name: 'Skill Group 2',
    description: 'Skill Group 2 description',
    skills: [
      { id: 4, name: 'Skill 4' },
      { id: 5, name: 'Skill 5' },
      { id: 6, name: 'Skill 6' },
    ],
  },
]

type AddSkillsStepProps = {
  next: () => void
}

const { I18n } = window


export const AddSkillsStep: FC<AddSkillsStepProps> = ({ next }) => {
  const { isMobile } = useContext(MediaQueryContext)
  const [openSelectedSkillsModal, setOpenSelectedSkillsModal] = useState(false)

  return (
    <>
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={{ span: 24 }} sm={{ span: 18 }}>
          <Space size={24} className="w-100" direction="vertical">
            {
            skillsGroups.map(skillGroup => (
              <SkillsGroupCard
                key={skillGroup.id}
                skillGroup={skillGroup}
                onAddSkill={() => null}
                onSkillClick={() => null}
              />
            ))
          }
          </Space>
        </Col>
        <SelectedSkillsCardResponsiveWrapper
          onClose={() => setOpenSelectedSkillsModal(false)}
          openSelectedSkillsModal={openSelectedSkillsModal}
        >
          <SelectedSkillsCard OnRemoveSkill={() => null} selectedSkills={selectedSkills} />
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
            label={I18n.t('idp.initial_steps.continue_to_rate_skills')}
            size="small"
            type="primary"
            onClick={() => next()}
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
