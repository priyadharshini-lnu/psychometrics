import React from 'react'
import { Select, Icon } from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { NAME } from 'constants/emailTemplate'
import { TYPES } from 'constants/emailCriteria'
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

export default function Criteria ({
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
      case TYPES.NAME_OR_EMAIL:
      case TYPES.FIRST_NAME:
      case TYPES.LAST_NAME:
        return <StringComparator {...props} />
      case TYPES.DATASHEET:
      case TYPES.SUBJECT_DATASHEET:
        return <DatasheetComparator {...props} />
      case TYPES.RELATIONSHIP:
        return <RelationshipComparator {...props} />
      case TYPES.NOMINATION_REQUIREMENTS:
        return <NominationRequirementComparator {...props} />
      case TYPES.SELF_EVALUATIONS:
        return <SelfEvaluationComparator {...props} />
      case TYPES.EVALUATIONS:
        return <EvaluationComparator {...props} />
      case TYPES.EVALUATIONS_RECEIVED:
        return <NumberComparator {...props} />
      case TYPES.TASKS:
        return <TaskComparator {...props} />
      case TYPES.MANAGER_TASKS:
        return <ManagerTaskComparator {...props} />
      case TYPES.EVALUATOR_TYPE:
        return <EvaluatorTypeComparator {...props} />
      default:
        return null
    }
  }

  return (
    <div className="mbm">
      <div>
        <Select dropdownMatchSelectWidth={false} size="small" value={field} onChange={value => update('field', value)}>
          <Select.Option key={TYPES.NAME_OR_EMAIL}>Name or Email</Select.Option>
          <Select.Option key={TYPES.LAST_NAME}>Last name</Select.Option>
          <Select.Option key={TYPES.FIRST_NAME}>First name</Select.Option>
          <Select.Option key={TYPES.DATASHEET}>Metadata</Select.Option>
          <Select.Option key={TYPES.RELATIONSHIP}>Has Relationship</Select.Option>
          <Select.Option key={TYPES.SELF_EVALUATIONS}>Self Evaluations</Select.Option>
          {evaluatorEmail() || [
            <Select.Option key={TYPES.NOMINATION_REQUIREMENTS}>Nomination Requirements</Select.Option>,
            <Select.Option key={TYPES.EVALUATIONS}>Evaluations</Select.Option>,
            <Select.Option key={TYPES.EVALUATIONS_RECEIVED}>Evaluations Received</Select.Option>,
            <Select.Option key={TYPES.TASKS}>Tasks</Select.Option>,
            <Select.Option key={TYPES.MANAGER_TASKS}>Manager Tasks</Select.Option>,
          ]
          }
          {evaluatorEmail() && [
            <Select.Option key={TYPES.SUBJECT_DATASHEET}>Subject Metadata</Select.Option>,
            <Select.Option key={TYPES.EVALUATOR_TYPE}>External Participants</Select.Option>,
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
