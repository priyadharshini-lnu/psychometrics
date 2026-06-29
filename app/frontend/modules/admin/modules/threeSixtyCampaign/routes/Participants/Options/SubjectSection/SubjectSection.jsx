import { Button } from 'antd'
import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'
import CriteriaList from './CriteriaList'
import NominationRequirementModal from './NominationRequirementModal'

export default function SubjectSection ({
  options,
  relationships,
  updateParticipantOptions,
  addDatasheetCriteriaWithDefaultValue,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  openNominationRequirementModal,
  updateRelationship,
}) {
  const OBJECT_KEY = 'subject'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

  const parametersForDatasheet = name => ({
    criteria: options[name],
    addCriteria: () => addDatasheetCriteriaWithDefaultValue([OBJECT_KEY, name]),
    removeCriteria: removeDatasheetCriteria([OBJECT_KEY, name]),
    updateCriteria: updateDatasheetCriteria([OBJECT_KEY, name]),
  })

  const parametersForRelationships = relationship => ({
    value: options.canSelectRelationships && options.canSelectRelationships[relationship.id],
    label: relationship.name,
    onChange: () => updateRelationship(OBJECT_KEY, relationship,
      !(options.canSelectRelationships && options.canSelectRelationships[relationship.id])),
  })

  return (
    <OptionSection label={I18n.t('admin.options_subject_options')}>
      <NominationRequirementModal />
      <ExpandableOption
        label={I18n.t('threesixty.options.subject.self_evaluates')}
        {...parametersForSwitch('canEvaluateSelf')}
      >
        {/* <ExpandableOption */}
        {/* label="Limit self-evaluators by criteria" */}
        {/* {...parametersForSwitch('limitSelfEvaluationByCriteria')} */}
        {/* type="checkbox" */}
        {/* actionable={<Button size="small">View 4 subjects</Button>} */}
        {/* > */}
        {/* <CriteriaList {...parametersForDatasheet('selfEvaluationCriteria')} /> */}
        {/* </ExpandableOption> */}
      </ExpandableOption>

      <ExpandableOption
        label={I18n.t('threesixty.options.subject.can_view_evaluators')}
        {...parametersForSwitch('canViewEvaluators')}
      />
      <ExpandableOption
        label={I18n.t('threesixty.options.subject.nominates_evaluators')}
        {...parametersForSwitch('canNominateEvaluators')}
        actionable={(
          <Button size="small" onClick={openNominationRequirementModal}>
            {
            I18n.t('threesixty.options.subject.define_nomination_requirement')}
          </Button>
        )}
      >
        <ExpandableOption
          label={I18n.t('threesixty.options.subject.anyone_not_in_assessment')}
          {...parametersForSwitch('canNominateAnyoneNotInAssessment')}
          type="checkbox"
        />
        <ExpandableOption
          label={I18n.t('threesixty.options.subject.anyone_in_assessment')}
          {...parametersForSwitch('canNominateAnyoneInAssessment')}
          type="checkbox"
        >
          <ExpandableOption
            label={I18n.t('threesixty.options.subject.only_show_subjects_who_match_criteria')}
            {...parametersForSwitch('limitNominationBySubjectToAnyoneInAssessment')}
            type="checkbox"
          >
            <CriteriaList {...parametersForDatasheet('limitNominationBySubjectToAnyoneCriteria')} />
          </ExpandableOption>
        </ExpandableOption>
        <ExpandableOption
          label={I18n.t('threesixty.options.subject.anyone_in_datasheet')}
          {...parametersForSwitch('canNominateAnyoneFromDatasheet')}
          type="checkbox"
        >
          <ExpandableOption
            label={I18n.t('threesixty.options.subject.limit_search_by_criteria')}
            {...parametersForSwitch('limitNominationBySubjectFromDatasheet')}
            type="checkbox"
          >
            <CriteriaList {...parametersForDatasheet('limitNominationBySubjectFromDatasheetCriteria')} />
          </ExpandableOption>
        </ExpandableOption>

        <ExpandableOption
          label={I18n.t('threesixty.options.subject.subjects_cannot_remove_nominations')}
          {...parametersForSwitch('cannotRemoveNominationSetByManagerAndAdmin')}
          type="checkbox"
        />
        <ExpandableOption
          label={I18n.t('threesixty.options.subject.allow_subjects_to_select_relationships')}
          {...parametersForSwitch('canSelectRelationship')}
          type="checkbox"
        >
          <ExpandableOption
            label={I18n.t('threesixty.options.subject.only_allow_relationships_of_specified_types')}
            {...parametersForSwitch('limitRelationshipThatSubjectCanSelect')}
            type="checkbox"
          >
            {relationships.map(relationship => (
              <ExpandableOption
                key={relationship.id}
                {...parametersForRelationships(relationship)}
                type="checkbox"
              />
            ))}
          </ExpandableOption>
        </ExpandableOption>
      </ExpandableOption>
    </OptionSection>
  )
}
