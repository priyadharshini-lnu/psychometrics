import React from 'react'
import { Button } from 'antd'
import CriteriaList from 'admin/core/project/components/DataSheet'
import OptionSection from '../OptionSection'
import ExpandableOption from '../ExpandableOption'

export default function SubjectSection ({ parametersForSwitch, parametersForDatasheet }) {
  return (
    <OptionSection label="Subject Options">
      <ExpandableOption label="Subject Self Evaluates" {...parametersForSwitch('subjectCanEvaluateSelf')}>
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
        {...parametersForSwitch('subjectCanNominateEvaluators')}
        actionable={<Button size="small">Define Nomination requirement</Button>}
      >
        <ExpandableOption
          label="Anyone not currently in the assessment"
          {...parametersForSwitch('subjectCanNominateAnyoneNotInAssessment')}
          type="checkbox"
        />
        <ExpandableOption
          label="Anyone in the assessment"
          {...parametersForSwitch('subjectCanNominateAnyoneInAssessment')}
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
          {...parametersForSwitch('subjectCanNominateAnyoneFromDatasheet')}
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
          {...parametersForSwitch('subjectCannotRemoveNominationSetByManagerAndAdmin')}
          type="checkbox"
        />
        <ExpandableOption
          label="Allow subjects to select relationships"
          {...parametersForSwitch('subjectCanSelectRelationship')}
          type="checkbox"
        >
          <ExpandableOption
            label="Only allow relationships of specified types"
            {...parametersForSwitch('limitRelationshipThatSubjectCanSelect')}
            type="checkbox"
          >
            <ExpandableOption
              label="Customer"
              {...parametersForSwitch('subjectCanSelectCustomerRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Direct Report"
              {...parametersForSwitch('subjectCanSelectDirectReportRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Manager"
              {...parametersForSwitch('subjectCanSelectManagerRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Peer"
              {...parametersForSwitch('subjectCanSelectPeerRelationship')}
              type="checkbox"
            />
            <ExpandableOption
              label="Supplier"
              {...parametersForSwitch('subjectCanSelectSupplierRelationship')}
              type="checkbox"
            />
          </ExpandableOption>
        </ExpandableOption>
      </ExpandableOption>

      <ExpandableOption
        label="Subjects can view completion status of evaluations"
        {...parametersForSwitch('subjectCanViewCompletionStatusOfEvaluation')}
      >
        <ExpandableOption
          label="Allow subjects to view the individual evaluations"
          {...parametersForSwitch('subjectCanViewIndividualEvaluations')}
          type="checkbox"
        />
      </ExpandableOption>
    </OptionSection>
  )
}
