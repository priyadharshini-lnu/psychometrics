import React from 'react'
import { Select, Icon } from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { NAME } from 'constants/emailTemplate'
import style from './style.scss'
import StringComparator from './Comparator/String'
import DatasheetComparator from './Comparator/Datasheet'
import RelationshipComparator from './Comparator/Relationship'
import NominationRequirementComparator from './Comparator/NominationRequirement'
import SelfEvaluationComparator from './Comparator/SelfEvaluation'
import EvaluationComparator from './Comparator/Evaluation'
import EvaluatorTypeComparator from './Comparator/EvaluatorType'

import NumberComparator from './Comparator/Number'
import TaskComparator from './Comparator/Task'
import ManagerTaskComparator from './Comparator/ManagerTask'

export default function RecipientCriteriaList ({
  emailName,
  criteria: {
    field, subField, comparator, value,
  },
  add,
  update,
  remove,
  merge,
}) {
  const evaluatorEmail = () => _.includes([NAME.EVALUATOR_INVITE, NAME.EVALUATOR_REMINDER], emailName)

  const renderComparator = () => {
    const props = {
      comparator,
      update,
      merge,
      subField,
      value,
    }
    switch (field) {
      case 'name_or_email':
      case 'first_name':
      case 'last_name':
        return <StringComparator {...props} />
      case 'datasheet':
      case 'subject_datasheet':
        return <DatasheetComparator {...props} />
      case 'relationship':
        return <RelationshipComparator {...props} />
      case 'nomination_requirements':
        return <NominationRequirementComparator {...props} />
      case 'self_evaluations':
        return <SelfEvaluationComparator {...props} />
      case 'evaluations':
        return <EvaluationComparator {...props} />
      case 'evaluations_received':
        return <NumberComparator {...props} />
      case 'tasks':
        return <TaskComparator {...props} />
      case 'manager_tasks':
        return <ManagerTaskComparator {...props} />
      case 'evaluator_type':
        return <EvaluatorTypeComparator {...props} />
      default:
        return null
    }
  }

  return (
    <div className="mbm">
      <div>
        <Select dropdownMatchSelectWidth={false} size="small" value={field} onChange={value => update('field', value)}>
          <Select.Option key="name_or_email">Name or Email</Select.Option>
          <Select.Option key="last_name">Last name</Select.Option>
          <Select.Option key="first_name">First name</Select.Option>
          <Select.Option key="datasheet">Metadata</Select.Option>
          <Select.Option key="relationship">Has Relationship</Select.Option>
          <Select.Option key="self_evaluations">Self Evaluations</Select.Option>
          {evaluatorEmail() || [
            <Select.Option key="nomination_requirements">Nomination Requirements</Select.Option>,
            <Select.Option key="evaluations">Evaluations</Select.Option>,
            <Select.Option key="evaluations_received">Evaluations Received</Select.Option>,
            <Select.Option key="tasks">Tasks</Select.Option>,
            <Select.Option key="manager_tasks">Manager Tasks</Select.Option>,
          ]
          }
          {evaluatorEmail() && [
            <Select.Option key="subject_datasheet">Subject Metadata</Select.Option>,
            <Select.Option key="evaluator_type">External Participants</Select.Option>,
          ]
          }
        </Select>
        <div className={cs(['mls', style.comparatorContainer])}>{renderComparator()}</div>
        <span>
          <Icon type="minus-circle" onClick={remove} className="mls" />
          <Icon type="plus-circle" onClick={add} className="mls" />
        </span>
      </div>
    </div>
  )
}
