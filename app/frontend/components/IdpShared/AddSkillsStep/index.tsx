import {
  useContext, useState, FC, ReactNode, useMemo,
} from 'react'
import {
  Row, Col, Space, Modal, Button,
} from 'antd'
import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import { SelectedSkillsCard } from '~/components/IdpShared/AddSkillsStep/SelectedSkillsCard'
import { ButtonWithArrow, BoxWithShadow, MediaQueryContext } from '~/glint'
import { CategoryWithSkillsSummary, UserIdpSkill } from '../DevelopmentActions'
import { SkillsGroupCard } from '~/components/IdpShared/SkillGroupCard'


type SearchSkillResourceProps = {
     isSearching: boolean,
     searchResults: { id: string|number; name: string }[],
     handleSearch: (value: string, skillType: string)=> void
  }

type AddSkillsStepProps = {
  onFinishAddSkill: () => void
  addSkillButtonText: string
  selectedSkills: UserIdpSkill[]
  skillCategories: CategoryWithSkillsSummary[]
  onDeselectSkill: (id: number) => void
  onAddSkill: (skills: { id: number; name: string }[]) => void
  isSubmitting?: boolean
  searchSkillResource: SearchSkillResourceProps
}


const { I18n } = window


export const AddSkillsStep: FC<AddSkillsStepProps> = ({
  onFinishAddSkill, addSkillButtonText,
  skillCategories, selectedSkills, onDeselectSkill, onAddSkill,
  isSubmitting = false, searchSkillResource,
}) => {
  const { isMobile } = useContext(MediaQueryContext)
  const [openSelectedSkillsModal, setOpenSelectedSkillsModal] = useState(false)
  const location = useLocation()
  const isStepsRoute = location.pathname.includes('idp/steps')

  // redux stores user_idp_skills which doesn't have same id as of skills resource
  // Using name instead of id as name is also unique
  const selectedSkillsNames = selectedSkills.map(({ name }) => name)
  const initialSelectedSkillsNames = useMemo(() => selectedSkillsNames, [])

  const isSelectedSkillsDirty = !_.isEqual(initialSelectedSkillsNames.sort(), selectedSkillsNames.sort())

  const disableAddSkillButton = isStepsRoute ? !selectedSkillsNames.length : !isSelectedSkillsDirty

  return (
    <>
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={{ span: 24 }} sm={{ span: 18 }}>
          <Space size={24} className="w-100" direction="vertical">
            {
            skillCategories.map((skillCategory) => {
              const skillsAvailableForSelection = skillCategory.skills.filter(
                skill => !selectedSkillsNames.includes(skill.name),
              )
              return (
                <SkillsGroupCard
                  skillCategory={{ skillType: skillCategory.skillType, skills: skillsAvailableForSelection }}
                  onAddSkill={onAddSkill}
                  onRemoveSkill={onDeselectSkill}
                  selectedSkills={selectedSkills}
                  handleSearch={searchSkillResource.handleSearch}
                  searchResults={searchSkillResource.searchResults}
                  isSearching={searchSkillResource.isSearching}
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
          <SelectedSkillsCard onRemoveSkill={onDeselectSkill} selectedSkills={selectedSkills} />
        </SelectedSkillsCardResponsiveWrapper>
      </Row>
      <Row justify="space-between" className="mt-6">
        {isMobile ? (
          <Col span={12}>
            <Button
              size="small"
              onClick={() => setOpenSelectedSkillsModal(true)}
              ghost
              type="primary"
              className="w-100"
            >
              {`${I18n.t('idp.initial_steps.selected_skills')} (${selectedSkills.length})`}
            </Button>
          </Col>
        ) : null}
        <Col span={isMobile ? 12 : 24}>
          <div className="flex justify-center">
            <ButtonWithArrow
              label={addSkillButtonText}
              size="small"
              type="primary"
              onClick={() => onFinishAddSkill()}
              loading={isSubmitting}
              disabled={disableAddSkillButton}
            />
          </div>
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
