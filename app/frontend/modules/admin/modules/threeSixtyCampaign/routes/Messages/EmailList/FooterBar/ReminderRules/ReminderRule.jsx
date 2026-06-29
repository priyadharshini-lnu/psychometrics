import { InputNumber } from 'antd'
import { MinusCircleOutlined, PlusCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'

export default function ReminderRule ({
  rule, add, remove, update,
}) {
  return (
    <div>
      <InputNumber
        size="small"
        className={styles.inputField}
        min={1}
        value={rule.days}
        onChange={(value) => {
          update('days', value)
        }}
      />
      {I18n.t('admin.days_repeated')}
      <InputNumber
        size="small"
        className={styles.inputField}
        min={1}
        value={rule.times}
        onChange={(value) => {
          update('times', value)
        }}
      />
      {I18n.t('admin.times')}
      <span>
        <MinusCircleOutlined onClick={remove} className={styles.deleteIcon} />
        <PlusCircleOutlined onClick={add} className={styles.addIcon} />
      </span>
    </div>
  )
}
