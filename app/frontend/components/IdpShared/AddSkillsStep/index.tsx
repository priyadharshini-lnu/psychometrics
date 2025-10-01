import {
  useContext, FC, useMemo,
} from 'react'
import {
  Row, Col, Space, Flex,
  Typography, Spin,
} from 'antd'
import { isEqual } from 'lodash'
import { useLocation } from 'react-router-dom'
import { ButtonWithArrow, MediaQueryContext, BackButton } from '~/glint'
import { TypeWithSkillsSummary, UserIdpSkill } from '../DevelopmentActions'
import { SkillsGroupCard } from '~/components/IdpShared/SkillGroupCard'
import { Separator } from '~/components/IdpShared/Separator'
import { DownloadButton } from '../DownloadButton'
import { FetchSkillGapsResponse } from
  '~/modules/endUser/modules/campaigns/core/idp/idpForm'

type SearchSkillResourceProps = {
     isSearching: boolean,
     searchResults: { id: string|number; name: string, skillType: string }[],
     handleSearch: (value: string, skillType: string)=> void
  }

type AddSkillsStepProps = {
  onFinishAddSkill: () => void
  addSkillButtonText: string
  selectedSkills: UserIdpSkill[]
  skillTypes: TypeWithSkillsSummary[]
  onDeselectSkill: (id: number) => void
  onAddSkill: (skills: { id: number; name: string }[]) => void
  isSubmitting?: boolean
  searchSkillResource: SearchSkillResourceProps
  showBackButton?: boolean
  skillGapReportData: FetchSkillGapsResponse | null
  isSkillGapReportLoading?:boolean
  skillGapReportAvailable?:boolean
  prev?: ()=>void
  isSkillsLoading?:boolean
}

const { I18n } = window

export const AddSkillsStep: FC<AddSkillsStepProps> = ({
  onFinishAddSkill, addSkillButtonText,
  skillTypes, selectedSkills, onDeselectSkill, onAddSkill,
  isSubmitting = false, searchSkillResource, showBackButton = true,
  skillGapReportData,
  isSkillGapReportLoading = false,
  skillGapReportAvailable = false,
  prev,
  isSkillsLoading = false,
}) => {
  const { isMobile } = useContext(MediaQueryContext)
  const location = useLocation()
  const isStepsRoute = location.pathname.includes('idp/steps') || location.pathname.includes('step/')
  // redux stores user_idp_skills which doesn't have same id as of skills resource
  // Using name instead of id as name is also unique
  const selectedSkillsNames = selectedSkills.map(({ name }) => name)
  const initialSelectedSkillsNames = useMemo(() => selectedSkillsNames, [])

  const isSelectedSkillsDirty = !isEqual(initialSelectedSkillsNames.sort(), selectedSkillsNames.sort())

  const disableAddSkillButton = isStepsRoute ? !selectedSkillsNames.length
    : (!isSelectedSkillsDirty || !selectedSkillsNames.length
    )

  return (
    <Flex vertical>
      <Flex gap={8} vertical={isMobile} className="mt-0 mb-4" flex={1} justify="space-between">
        <Space>
          {showBackButton && (
            <BackButton
              onPrev={prev}
            />
          )}
          <Typography.Title level={3} className="mb-0 mt-0">
            {I18n.t('idp.initial_steps.add_skills_step')}
          </Typography.Title>
        </Space>
        <Flex gap={8} vertical={isMobile} justify="end" align="end">
          {skillGapReportAvailable && (
            <Spin spinning={isSkillGapReportLoading}>
              <DownloadButton
                disabled={skillGapReportData?.status !== 'prepared'}
                href={skillGapReportData?.report_url}
                style={{
                  height: '2rem',
                }}
              >
                {I18n.t('idp.skill_gap_report.download')}
              </DownloadButton>
            </Spin>
          )}

          <ButtonWithArrow
            label={addSkillButtonText}
            type="primary"
            onClick={() => onFinishAddSkill()}
            loading={isSubmitting}
            disabled={disableAddSkillButton}
          />
        </Flex>
      </Flex>
      <Separator className="mb-4 mt-0" />
      <Spin spinning={isSkillsLoading}>
        <Row gutter={[24, 24]} className="mt-6">
          <Col>
            <Space size={24} className="w-100" direction="vertical">
              {
            skillTypes.map((skillType, index) => (
              <Flex vertical key={skillType.skillType}>
                <SkillsGroupCard
                  skillType={{ skillType: skillType.skillType, skills: skillType.skills }}
                  onAddSkill={onAddSkill}
                  onRemoveSkill={onDeselectSkill}
                  selectedSkills={selectedSkills}
                  handleSearch={searchSkillResource.handleSearch}
                  searchResults={searchSkillResource.searchResults
                    .filter(result => result.skillType === skillType.skillType)}
                  isSearching={searchSkillResource.isSearching}
                />
                {index === 0 && (
                  <Separator className="mb-4 mt-4" />
                )}
              </Flex>
            ))
          }
            </Space>
          </Col>
        </Row>
      </Spin>
    </Flex>
  )
}
