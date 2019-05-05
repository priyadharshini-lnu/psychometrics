import React from 'react'
import { Button } from 'antd'
import CriteriaList from 'admin/core/project/components/DataSheet'
import OptionSection from '../OptionSection'
import ExpandableOption from '../ExpandableOption'

export default function SubjectSection ({
  options,
  updateParticipantOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
}) {
  const OBJECT_KEY = 'subject'

  function parametersForSwitch (name) {
    return {
      value: options[name],
      onOptionChanged: updateParticipantOptions.bind(this, [OBJECT_KEY, name]),
    }
  }

  function parametersForDatasheet (name) {
    return {
      criteria: options[name],
      addCriteria: addDatasheetCriteria.bind(this, [OBJECT_KEY, name]),
      removeCriteria: removeDatasheetCriteria.bind(this, [OBJECT_KEY, name]),
      updateCriteria: updateDatasheetCriteria.bind(this, [OBJECT_KEY, name]),
    }
  }

  return (
    <OptionSection label="Subject Options">
      <ExpandableOption label="Subject Self Evaluates" {...parametersForSwitch('canEvaluateSelf')}>
        <ExpandableOption
          label="Limit self-evaluators by criteria"
          {...parametersForSwitch('limitSelfEvaluationByCriteria')}
          type="checkbox"
          actionable={<Button size="small">View 4 subjects</Button>}
        >
          <CriteriaList {...parametersForDatasheet('selfEvaluationCriteria')} />
        </ExpandableOption>
      </ExpandableOption>

      <ExpandableOption
        label="Subject Nominates Evaluators"
        {...parametersForSwitch('canNominateEvaluators')}
        actionable={<Button size="small">Define Nomination requirement</Button>}
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
          label="Anyone in the DataSheet"
          {...parametersForSwitch('canNominateAnyoneFromDatasheet')}
          type="checkbox"
        >
          <ExpandableOption
            label="Limit search by criteria"
            {...parametersForSwitch('limitNominationbySubjectFromDatasheet')}
            type="checkbox"
          >
            <CriteriaList {...parametersForDatasheet('limitNominationbySubjectFromDatasheetCriteria')} />
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
            <ExpandableOption
              label="Customer"
              {...parametersForSwitch('canSelectCustomerRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Direct Report"
              {...parametersForSwitch('canSelectDirectReportRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Manager"
              {...parametersForSwitch('canSelectManagerRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Peer"
              {...parametersForSwitch('canSelectPeerRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Supplier"
              {...parametersForSwitch('canSelectSupplierRelationship')}
              type="checkbox"
            />
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
