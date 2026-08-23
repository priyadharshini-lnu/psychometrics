import { useId } from 'react'
import {
  Select,
} from 'antd'
import _ from 'lodash'
import styles from './styles.less'

export default function TitleBar ({ emailSchedules: { list, selectedId }, changeSelected }) {
  const selectedEmailSchedule = _.find(list, ({ id }) => id === selectedId)

  return (
    <div className={styles.container}>
      <Message emailSchedules={list} changeSelected={changeSelected} selectedId={selectedId} />
      <div>
        {I18n.t(`admin.${selectedEmailSchedule.name}_description`)}
      </div>
    </div>
  )
}


const Message = ({ emailSchedules, changeSelected, selectedId }) => {
  const messageSelectId = useId()

  if (emailSchedules.length > 1) {
    return (
      <div>
        <label htmlFor={messageSelectId}>{`${I18n.t('admin.messages')}:`}</label>
        <Select id={messageSelectId} className="mls" value={selectedId} onChange={changeSelected}>
          {emailSchedules.map(emailSchedule => (
            <Select.Option value={emailSchedule.id} key={emailSchedule.id}>
              {I18n.t(`admin.${emailSchedule.name}_name`)}
            </Select.Option>
          ))}
        </Select>
      </div>
    )
  }

  return <div>{I18n.t(`admin.${emailSchedules[0].name}_name`)}</div>
}
