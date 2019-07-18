import React from 'react'
import {
  Select,
} from 'antd'
import _ from 'lodash'
import style from './style.scss'

export default function TitleBar ({ emailSchedules: { list, selectedId }, changeSelected }) {
  const selectedEmailSchedule = _.find(list, ({ id }) => id === selectedId)

  return (
    <div className={style.container}>
      <div>
        Messages:
        <Select className="mls" value={selectedId} onChange={changeSelected}>
          {list.map(emailSchedule => (
            <Select.Option value={emailSchedule.id} key={emailSchedule.id}>
              {I18n.t(`administration.threesixty_campaigns.email_templates.${emailSchedule.name}.name`)}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        {I18n.t(`administration.threesixty_campaigns.email_templates.${selectedEmailSchedule.name}.description`)}
      </div>
    </div>
  )
}
