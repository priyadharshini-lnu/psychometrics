import React from 'react'
import _ from 'lodash'
import { Select, Button } from 'antd'
import pluralize from 'pluralize'
import Criteria from './Criteria'

export default function RecipientCriteriaList ({
  emailName,
  recipientType,
  recipientsCount,
  recipientCriteria,
  openModal,
  add,
  update,
  remove,
  merge,
}) {
  return (
    <div className="mbm">
      <div className="mbm">
        <b>To:</b>
        <ViewParticipantButton recipientType={recipientType} recipientsCount={recipientsCount} openModal={openModal} />
      </div>
      {_.isEmpty(recipientCriteria) && (
        <Select defaultValue="everyone" dropdownMatchSelectWidth={false} onChange={() => add()}>
          <Select.Option key="everyone">Everyone</Select.Option>
          <Select.Option key="participants">Participants By Criteria...</Select.Option>
        </Select>
      )}
      {!_.isEmpty(recipientCriteria) && (
        <div className="mbs">
          {recipientCriteria.map((criteria, index) => (
            <Criteria
              emailName={emailName}
              key={index}
              criteria={criteria}
              add={add}
              remove={() => remove(index)}
              update={(field, value) => update(index, field, value)}
              merge={attributes => merge(index, attributes)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ViewParticipantButton = ({ recipientsCount, recipientType, openModal }) => {
  if (_.isNull(recipientsCount)) { return null }

  if (recipientsCount === 0) {
    return (
      <Button className="mlm" type="primary" size="small" disabled="true">
        No
        {' '}
        {pluralize.plural(recipientType)}
        {' '}
for this criteria
      </Button>
    )
  }
  return (
    <Button className="mlm" type="primary" size="small" onClick={() => openModal('RecipientListModal')}>
        View
      {' '}
      {recipientsCount}
      {' '}
      {pluralize(recipientType, recipientsCount)}
    </Button>
  )
}
