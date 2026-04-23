import { ReactNode, FC } from 'react'
import { Tooltip, Checkbox } from 'antd'
import cs from 'classnames'
import { TooltipPlacement } from 'antd/es/tooltip'
import styles from './HintCheckbox.less'

type Props = {
  label?: ReactNode
  className?: string
  hintClassName?: string
  rootClassName?: string
  checked: boolean
  hints: [active: string, inactive: string]
  onChange: (checked: boolean) => void
  placement?: TooltipPlacement
  disabled?: boolean
}

export const HintCheckbox: FC<Props> = ({
  checked, onChange, disabled, label, hints, className, hintClassName, rootClassName, placement = 'left',
}) => (
  <div className={styles.container} onClick={() => !disabled && onChange(!checked)}>
    <Tooltip
      placement={placement}
      classNames={{ root: cs(styles.tooltip, rootClassName) }}
      title={(
        <div className={cs(styles.hint, className)}>
          <div className={cs(hintClassName, { [styles.active]: checked })}>
            {hints[0]}
          </div>
          <div className={cs(hintClassName, { [styles.active]: !checked })}>
            {hints[1]}
          </div>
        </div>
      )}
    >
      <Checkbox disabled={disabled} checked={checked} />
      {' '}
      {label}
    </Tooltip>
  </div>
)
