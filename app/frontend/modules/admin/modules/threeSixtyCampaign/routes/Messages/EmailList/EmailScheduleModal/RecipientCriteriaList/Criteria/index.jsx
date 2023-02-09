import { Select } from 'antd'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import _ from 'lodash'
import cs from 'classnames'
import { NAME } from '~/modules/admin/constants/emailTemplate'
import { TYPES } from '~/modules/admin/constants/emailCriteria'
import styles from './styles.less'
import Comparators from './Comparators'

const isEvaluatorEmail = name => _.includes([NAME.EVALUATOR_INVITE, NAME.EVALUATOR_REMINDER], name)
const isInvitationEmail = name => _.includes([NAME.EVALUATOR_INVITE, NAME.SUBJECT_INVITE], name)

const OPTIONS = [
  { name: 'Name or Email', key: TYPES.NAME_OR_EMAIL },
  { name: 'Last name', key: TYPES.LAST_NAME },
  { name: 'First name', key: TYPES.FIRST_NAME },
  { name: 'Metadata', key: TYPES.DATASHEET },
  { name: 'Has Relationship', key: TYPES.RELATIONSHIP },
  { name: 'Self Evaluations', key: TYPES.SELF_EVALUATIONS },
  {
    name: 'Nomination Requirements',
    key: TYPES.NOMINATION_REQUIREMENTS,
    condition: ({ emailName }) => !isEvaluatorEmail(emailName),
  },
  { name: 'Evaluations', key: TYPES.EVALUATIONS, condition: ({ emailName }) => !isEvaluatorEmail(emailName) },
  {
    name: 'Evaluations Received',
    key: TYPES.EVALUATIONS_RECEIVED,
    condition: ({ emailName }) => !isEvaluatorEmail(emailName),
  },
  // { name: 'Tasks', key: TYPES.TASKS, condition: ({ emailName }) => !isEvaluatorEmail(emailName) },
  { name: 'Manager Tasks', key: TYPES.MANAGER_TASKS, condition: ({ emailName }) => !isEvaluatorEmail(emailName) },
  { name: 'Subject Metadata', key: TYPES.SUBJECT_DATASHEET, condition: ({ emailName }) => isEvaluatorEmail(emailName) },
  {
    name: 'External Participants',
    key: TYPES.EVALUATOR_TYPE,
    condition: ({ emailName }) => isEvaluatorEmail(emailName),
  },
  { name: 'Invitation', key: TYPES.INVITATION, condition: ({ emailName }) => isInvitationEmail(emailName) },
]

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
  const renderComparator = () => {
    const Comparator = Comparators[field]
    if (!Comparator) return null

    return <Comparator comparator={comparator} update={update} merge={merge} subField={subField} value={value} />
  }

  return (
    <div className="mbm">
      <div>
        <Select dropdownMatchSelectWidth={false} size="small" value={field} onChange={value => update('field', value)}>
          {OPTIONS.map(
            option => (!option.condition || option.condition({ emailName })) && (
            <Select.Option key={option.key}>{option.name}</Select.Option>
            ),
          )}
        </Select>
        <div className={cs(['mls', styles.comparatorContainer])}>{renderComparator()}</div>
        <span>
          <MinusCircleOutlined onClick={remove} className="mls" />
          <PlusCircleOutlined onClick={add} className="mls" />
        </span>
      </div>
    </div>
  )
}
