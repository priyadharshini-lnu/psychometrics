import React from 'react'
import { Button } from 'antd'
import CriteriaList from 'admin/core/project/components/CriteriaList'
import OptionSection from 'admin/core/threeSixtyCampaign/components/common/Options/Section'
import ExpandableOption from 'admin/core/threeSixtyCampaign/components/common/Options/Expandable'
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
    onOptionChanged: updateParticipantOptions([OBJECT_KEY, name]),
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
    onOptionChanged: () => updateRelationship(OBJECT_KEY, relationship,
      !(options.canSelectRelationships && options.canSelectRelationships[relationship.id])),
  })

  return (
    <OptionSection label="Subject Options">
      <NominationRequirementModal />
      <ExpandableOption label="Subject Self Evaluates" {...parametersForSwitch('canEvaluateSelf')}>
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
        label="Subject nominates Evaluators"
        {...parametersForSwitch('canNominateEvaluators')}
        actionable={
          <Button size="small" onClick={openNominationRequirementModal}>Define Nomination requirement</Button>
        }
      >
        <ExpandableOption
          label="Anyone not currently in the assessment"
          {...parametersForSwitch('canNominateAnyoneNotInAssessment')}
          type="checkbox"
        />
        <ExpandableOption
          label="Anyone in the assessment"
          {...parametersForSwitch('canNominateAnyoneInAssessment')}
          type="checkbox"
        >
          <ExpandableOption
            label="Only show subjects who match the following criteria:"
            {...parametersForSwitch('limitNominationBySubjectToAnyoneInAssessment')}
            type="checkbox"
          >
            <CriteriaList {...parametersForDatasheet('limitNominationBySubjectToAnyoneCriteria')} />
          </ExpandableOption>
        </ExpandableOption>
        <ExpandableOption
          label="Anyone in the dataSheet"
          {...parametersForSwitch('canNominateAnyoneFromDatasheet')}
          type="checkbox"
        >
          <ExpandableOption
            label="Limit search by criteria"
            {...parametersForSwitch('limitNominationBySubjectFromDatasheet')}
            type="checkbox"
          >
            <CriteriaList {...parametersForDatasheet('limitNominationBySubjectFromDatasheetCriteria')} />
          </ExpandableOption>
        </ExpandableOption>

        <ExpandableOption
          label="Subjects cannot remove nominations set by managers or admins"
          {...parametersForSwitch('cannotRemoveNominationSetByManagerAndAdmin')}
          type="checkbox"
        />
        <ExpandableOption
          label="Allow subjects to select relationships"
          {...parametersForSwitch('canSelectRelationship')}
          type="checkbox"
        >
          <ExpandableOption
            label="Only allow relationships of specified types"
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

      <ExpandableOption
        label="Subjects can view completion status of evaluations"
        {...parametersForSwitch('canViewCompletionStatusOfEvaluation')}
      >
        <ExpandableOption
          label="Allow subjects to view the individual evaluations"
          {...parametersForSwitch('canViewIndividualEvaluations')}
          type="checkbox"
        />
      </ExpandableOption>
    </OptionSection>
  )
}
