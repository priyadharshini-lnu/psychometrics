import { DeleteOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { rgba2hex } from '~/utils/color'
import { ColorPicker } from '~/glint'
import styles from './styles.less'

export default function ScoreRange ({
  scoreRange, onRemove, onUpdate, showColorPicker,
}) {
  const removeScoreRange = () => onRemove(scoreRange)
  const updateScoreRange = ({ currentTarget }) => onUpdate(scoreRange.id, {
    [currentTarget.name]: Number(currentTarget.value),
  })

  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <input
          type="number"
          className={styles.inputValue}
          onChange={updateScoreRange}
          name="value"
          placeholder="Value"
          defaultValue={scoreRange.value}
          autoComplete="off"
        />
        {showColorPicker && (
          <ColorPicker
            swatchClassName={styles.swatch}
            value={scoreRange.color ? rgba2hex(scoreRange.color) : '#cccccc'}
            onChange={color => onUpdate(scoreRange.id, { color })}
          />
        )}
        <Button
          size="small"
          type="link"
          danger
          icon={<DeleteOutlined className={styles.remove} onClick={removeScoreRange} />}
        />
      </div>
    </div>
  )
}
