import React from 'react'
import {
  Select,
} from 'antd'
import _ from 'lodash'
import styles from './styles.scss'

export default function TitleBar ({ emailSchedules: { list, selectedId }, changeSelected }) {
  const selectedEmailSchedule = _.find(list, ({ id }) => id === selectedId)

  return (
    <div className={styles.container}>
      <Message emailSchedules={list} changeSelected={changeSelected} selectedId={selectedId} />
      <div>
        {I18n.t(`administration.threesixty_campaigns.email_templates.${selectedEmailSchedule.name}.description`)}
      </div>
    </div>
  )
}


const Message = ({ emailSchedules, changeSelected, selectedId }) => {
  if (emailSchedules.length > 1) {
    return (
      <div>
      Messages:
        <Select className="mls" value={selectedId} onChange={changeSelected}>
          {emailSchedules.map(emailSchedule => (
            <Select.Option value={emailSchedule.id} key={emailSchedule.id}>
              {I18n.t(`administration.threesixty_campaigns.email_templates.${emailSchedule.name}.name`)}
            </Select.Option>
          ))}
        </Select>
      </div>
    )
  }

  return <div>{I18n.t(`administration.threesixty_campaigns.email_templates.${emailSchedules[0].name}.name`)}</div>
}
